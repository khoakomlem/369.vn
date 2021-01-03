import * as utils from "../utils/index.js";

const getFriendList = async token => {
	const {data} = await $.ajax({
		url: `https://graph.facebook.com/me/friends?limit=5000&fields=id,name&access_token=${token}`,
		method: "GET"
	});
	return data;
};

const avatarUrl = async (id, token) => {
	return (
		await fetch(
			`https://graph.facebook.com/${id}/picture?height=500&access_token=${token}`
		)
	).url;
};

const getReact = async (id, limit, token, fb_dtsg) => {
	return JSON.parse(
		await $.ajax({
			url: "https://www.facebook.com/api/graphql/",
			method: "POST",
			data: {
				fb_dtsg,
				q: `node(${id}){timeline_feed_units.first(${limit}).after(){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id}},commenters{nodes{id}}}}}}}`
			}
		})
	)[id].timeline_feed_units.edges;
};

const removeFriend = async (id, token, fb_dtsg) => {
	await $.ajax({
		url: "https://www.facebook.com/ajax/profile/removefriendconfirm.php",
		method: "POST",
		data: {
			fb_dtsg,
			uid: id
		}
	});
};

const inc = (id, arr, i = 1) => {
	const index = arr.findIndex(e => e.id == id);
	if (index != -1) arr[index].score += i;
};

const getFuckFriends = (friendList, min = 0) => {
	const fuckFriends = [];
	for (const friend of friendList) {
		if (friend.score <= min) {
			fuckFriends.push(friend);
		}
	}
	console.log(fuckFriends);
	return fuckFriends;
};

const initScore = friendList => {
	for (const friend of friendList) {
		friend.score = 0;
	}
};

const initAvatarUrl = async (friendList, token) => {
	for (const friend of friendList) {
		friend.avatarUrl = await avatarUrl(friend.id, token);
	}
};

const search = async (limit, min) => {
	const getData = await utils.getData();
	const token = await utils.token(getData);
	const friendList = await getFriendList(token);
	initScore(friendList);
	// await initAvatarUrl(friendList, token);
	const {id} = await utils.tokenData(token);
	const fb_dtsg = utils.fb_dtsg(getData);
	const posts = await getReact(id, limit, token, fb_dtsg);
	for (let i = 0; i < posts.length; i++) {
		const post = posts[i].node.feedback;
		if (!post) continue;
		for (const reactor of post.reactors.nodes) {
			inc(reactor.id, friendList, 1);
		}
		for (const commenter of post.commenters.nodes) {
			inc(commenter.id, friendList, 2);
		}
	}
	// friendList.sort((a, b) => b.score - a.score);
	alert("Check dev tool");
	return getFuckFriends(friendList, min);
};

$("#search").click(() => {
	search($("#limit").val(), $("#min").val());
});
