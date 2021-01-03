import * as utils from "../utils/index.js";

const htmlDecode = input => {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
};

const getsomething = async (groupID, postID) => {
	//  :/
	const source = await $.ajax({
		url: `https://m.facebook.com/groups/${groupID}/permalink/${postID}/`,
		method: "GET"
	});
	return {
		feedobjects_identifiers: /feedobjectsIdentifiers&quot;:&quot;(.*?)&quot;/.exec(
			source
		)[1],
		eav: /&amp;eav=(.*?)&amp;av=/.exec(source)[1],
		av: /&amp;av=(.*?)&amp;gfid=/.exec(source)[1]
	};
};

const get_hideable_token = async (id, feedobjects_identifiers, fb_dtsg) => {
	return /hideable_token=(.*?)&amp;story_token=/.exec(
		await $.ajax({
			url: `https://m.facebook.com/story_chevron_menu/?is_menu_registered=false`,
			method: "POST",
			data: `feedobjects_identifiers=${feedobjects_identifiers}&feed_context={"use_m_feed":true,"is_permalink":true,"m_entstream_source":"permalink","previous_cursor":"","story_node_id":"u_0_t","show_attachments":true,"is_attached_story":false}&fb_dtsg=${fb_dtsg}&story_node_id=u_0_t&chevron_button_id=u_0_u&jazoest=21900`
		})
	)[1];
};

const getFeeds = async (id, token) => {
	//${groupID}
	const {data} = await $.ajax({
		url: `https://graph.facebook.com/${id}/feed?limit=300&access_token=${token}`,
		method: "GET"
	});
	return data;
};

const deletePost = async (
	postID,
	av,
	eav,
	feedobjects_identifiers,
	hideable_token,
	fb_dtsg
) => {
	return await $.ajax({
		url: `https://m.facebook.com/trust/afro/direct_action_execute?hideable_token=${hideable_token}&story_token=${feedobjects_identifiers}&action_name=DELETE&action_dom_id=u_o_0&story_location=permalink&story_render_location=permalink&confirmed=1&is_permalink=1&redirect_uri=%2Fhome.php&eav=${eav}&av=${av}`,
		method: "POST",
		data: `fb_dtsg=${fb_dtsg}&__req=b&__a=${hideable_token}`
	});
};

$(document).ready(async () => {
	const getData = await utils.getData();
	const token = utils.token(getData);
	const fb_dtsg = utils.fb_dtsg(getData);
	// const {id: uid} = await utils.tokenData(token);

	$("#remove").click(async () => {
		const groupID = $("#id")
			.val()
			.trim();
		const posts = await getFeeds(groupID, token);
		for (const post of posts) {
			post.id = post.id.split("_")[1];
			$("#log").prepend(
				`<div class="alert alert-info" role="alert">Xoá bài viết ${post.id} <p id="load${post.id}">[...]<p></div>`
			);
			const something = await getsomething(groupID, post.id);
			const {feedobjects_identifiers, eav, av} = something;
			const hideable_token = await get_hideable_token(
				groupID,
				feedobjects_identifiers,
				fb_dtsg
			);
			await deletePost(
				post.id,
				av,
				eav,
				feedobjects_identifiers,
				hideable_token,
				fb_dtsg
			);
			$(`#load${post.id}`).html("[♥]");
			await utils.asyncWait(3000);
		}
	});
});
