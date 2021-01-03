import * as utils from "../utils/index.js";

const getsomething = async (groupID, postID) => {
	//  :/
	const source = await $.ajax({
		url: `https://m.facebook.com/groups/${groupID}/permalink/${postID}/`,
		method: "GET"
	});
	console.log(source);
	return {
		feedobjects_identifiers: /feedobjectsIdentifiers&quot;:&quot;(.*?)&quot;/.exec(
			source
		)[1]
	};
};

const get_hideable_token = async (id, feedobjects_identifiers, fb_dtsg) => {
	return /hideable_token=(.*?)&amp;story_token=/.exec(
		await $.ajax({
			url: `https://m.facebook.com/story_chevron_menu/?is_menu_registered=false&group_id=${id}`,
			method: "POST",
			data: `feedobjects_identifiers=${feedobjects_identifiers}&feed_context={"use_m_feed":true,"is_permalink":true,"m_entstream_source":"permalink","previous_cursor":"","story_node_id":"u_0_t","show_attachments":true,"is_attached_story":false}&fb_dtsg=${fb_dtsg}&story_node_id=u_0_t&chevron_button_id=u_0_u&jazoest=21900`
		})
	)[1];
};

const deletePost = async (
	groupID,
	postID,
	feedobjects_identifiers,
	hideable_token,
	fb_dtsg
) => {
	return await $.ajax({
		url: `https://m.facebook.com/trust/afro/direct_action_execute?hideable_token=${hideable_token}&story_token=${feedobjects_identifiers}&action_name=DELETE&action_dom_id=m_story_permalink_view&story_location=permalink&story_render_location=permalink&is_permalink=1&redirect_uri=%2Fhome.php&dom_id=u_0_t`,
		method: "POST",
		data: `fb_dtsg=${fb_dtsg}&jazoest=22075&__req=b&__a=AYnwOyLK1KkahhrUuoDYdxS9M9hM1m6Jqtd7KzORKczzB2Ppr7bx_nw5hrzN7udy3VPLeok8W0WMDAbBSEFIG2V4feE1JwdCzi6GAplFm5Wrug&__user=100007723935647`
	});
};

$(document).ready(async () => {
	const getData = await utils.getData();
	const token = utils.token(getData);
	const fb_dtsg = utils.fb_dtsg(getData);
	const groupID = 385744602751402;
	globalThis.content = await $.ajax({
		url: `https://mbasic.facebook.com/groups/${groupID}/madminpanel/`,
		method: "GET"
	});
	const re = RegExp(`_ft_=top_level_post_id.(.*?)%3Acontent_owner_id_new`, "g");
	let match;
	const ids = [];
	while ((match = re.exec(content)) !== null) {
		ids.indexOf(match[1]) == -1 && ids.push(match[1]);
	}
	for (const id of ids) {
		const something = await getsomething(groupID, id);
		const {feedobjects_identifiers} = something;
		const hideable_token = await get_hideable_token(
			groupID,
			feedobjects_identifiers,
			fb_dtsg
		);
		console.log(hideable_token);
		console.log(
			await deletePost(
				groupID,
				id,
				feedobjects_identifiers,
				hideable_token,
				fb_dtsg
			)
		);
		console.log("idk");
	}
});
