import * as utils from "../utils/index.js";

const htmlDecode = input => {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
};

const getsomething1 = async (groupID, postID) => {
	const source = await $.ajax({
		url: `https://www.facebook.com/groups/${groupID}/permalink/${postID}/`,
		method: "GET"
	});
	return {
		story_id: /"storyID":"(.*?)"},"entryPoint"/.exec(source)[1],
		av: /{"actorID":"(.*?)","rootView"/.exec(source)[1]
	};
};

const getsomething2 = async (av, fb_dtsg, story_id) => {
	//  :/
	const uid = 100007723935647;
	const source = await $.ajax({
		url: "https://www.facebook.com/api/graphql/",
		method: "POST",
		data: `av=${av}&__user=${uid}&__a=1&fb_dtsg=${fb_dtsg}&jazoest=21955&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFeedStoryMenuQuery&variables=%7B%22feed_location%22%3A%22GROUP%22%2C%22id%22%3A%22${story_id}%22%2C%22scale%22%3A1%2C%22serialized_frtp_identifiers%22%3Anull%2C%22story_debug_info%22%3Anull%7D&server_timestamps=true&doc_id=3926770734022127`
	});
	return {
		memberID: /GeneralGroupContextualProfile","id":"(.*?)","name"/.exec(source)[1]
	};
};

const getFeeds = async (id, token) => {
	//${groupID}
	const {data} = await $.ajax({
		url: `https://graph.facebook.com/${id}/feed?limit=300&access_token=${token}`,
		method: "GET"
	});
	return data;
};

const deletePost = async (av, uid, fb_dtsg, groupID, story_id, memberID) => {
	return await $.ajax({
		url: "https://www.facebook.com/api/graphql/",
		method: "POST",
		data: `av=${av}&__user=${uid}&__a=1&__req=3e&__beoa=0&__pc=EXP2%3Acomet_pkg&dpr=1&__ccg=EXCELLENT&__rev=1003133664&__comet_req=1&__comet_env=fb&fb_dtsg=${fb_dtsg}&jazoest=22069&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useGroupRemovePostAsAdminMutation&variables=%7B%22input%22%3A%7B%22admin_notes%22%3A%22%22%2C%22group_id%22%3A%22${groupID}%22%2C%22selected_rules%22%3A%5B%5D%2C%22share_feedback%22%3Afalse%2C%22source%22%3A%22group_mall%22%2C%22story_id%22%3A%22${story_id}%22%2C%22actor_id%22%3A%22${av}%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22memberID%22%3A%22${memberID}%22%7D&server_timestamps=true&doc_id=3025841290865494&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D30605361%22%5D`
	});
};

$(document).ready(async () => {
	const getData = await utils.getData();
	const token = utils.token(getData);
	const fb_dtsg = utils.fb_dtsg(getData);
	const {id: uid} = await utils.tokenData(token);

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
			const {story_id, av} = await getsomething1(groupID, post.id);
			const st = await getsomething2(av, fb_dtsg, story_id);
			const {memberID} = st;
			await deletePost(av, uid, fb_dtsg, groupID, story_id, memberID);
			$(`#load${post.id}`).html("[♥]");
			await utils.asyncWait(3000);
		}
	});
});
