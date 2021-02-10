import * as utils from "../utils/index.js";

const getFriendList = async token => {
	const {data} = await $.ajax({
		url: `https://graph.facebook.com/me/friends?limit=5000&fields=id,name&access_token=${token}`,
		method: "GET"
	});
	return data;
};

const getReact = async (id, token, fb_dtsg) => {
	return JSON.parse(
		await $.ajax({
			url: "https://www.facebook.com/api/graphql/",
			method: "POST",
			data: {
				fb_dtsg,
				q: `node(${id}){timeline_feed_units.first(300).after(){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id}},commenters{nodes{id}}}}}}}`
			}
		})
	)[id].timeline_feed_units.edges;
};

const getMessage = async (fb_dtsg) => {
	return JSON.parse(await $.ajax({
		url: "https://www.facebook.com/api/graphql",
		method: "POST",
		data: {
			fb_dtsg,
			q: "viewer(){message_threads{nodes{thread_key{thread_fbid,other_user_id},all_participants{nodes{messaging_actor{name,gender,profile_picture}}},messages_count,name,image,thread_type}}}"
		}
	})).viewer.message_threads.nodes.filter(e=>e.all_participants.nodes.length==2);
}

const removeFriend = async (id, token, fb_dtsg) => {
	await $.ajax({
		url: `https://m.facebook.com/a/removefriend.php?friend_id=${id}&unref=bd_profile_button`,
		method: "POST",
		data: `fb_dtsg=${fb_dtsg}`
	});
};

class Friend {
	constructor({id, react = 0, cmt = 0, name = "", messages=0} = {}, token) {
		this.id = id;
		this.react = react;
		this.cmt = cmt;
		this.name = name;
		this.messages = messages;
		this.img = `<img src="https://graph.facebook.com/${id}/picture?height=500&access_token=${token}" style="width: 30px; height: 30px; border-radius: 100px;" alt="avatar ${name}">`;
	}
}

const init = async (friendList, token) => {
	for (let friend of friendList) {
		Object.assign(friend, new Friend(friend, token));
	}
};

const updateTable = (friends, table) => {
	table.clear();
	for (const friend of friends) {
		const {id, name, img, react, cmt, messages} = friend;
		table.row.add([
			`<th class="no-sort" ><input id="${id}" type="checkbox" class="form-control checkbox"></th>`,
			name,
			img,
			react,
			cmt,
			messages
		]);
	}
	table.draw();
};

$(document).ready(async () => {
	const table = $("#zero-conf").DataTable({
		order: [],
		columnDefs: [
			{
				targets: "no-sort",
				orderable: false,
				checkboxes: {
					selectRow: true
				}
			}
		]
	});
	globalThis.table = table;
	const getData = await utils.getData();
	const token = await utils.token(getData);
	const friendList = await getFriendList(token);
	init(friendList, token);
	const {id: uid} = await utils.tokenData(token);
	const fb_dtsg = utils.fb_dtsg(getData);


	const posts = await getReact(uid, token, fb_dtsg);
	for (let i = 0; i < posts.length; i++) {
		const post = posts[i].node.feedback;
		if (!post) continue;
		for (const reactor of post.reactors.nodes) {
			const index = friendList.findIndex(e => e.id == reactor.id);
			if (index != -1) friendList[index].react++;
		}
		for (const commenter of post.commenters.nodes) {
			const index = friendList.findIndex(e => e.id == commenter.id);
			if (index != -1) friendList[index].cmt++;
		}
	}
	const messages = await getMessage(fb_dtsg);
	for (let i=0; i<messages.length; i++) {
		const message = messages[i];
		const index = friendList.findIndex(e => e.id == message.thread_key.other_user_id);
		if (index != -1) friendList[index].messages = message.messages_count;
	}

	updateTable(friendList, table);
	$("#search").click(() => {
		$("#search").prop("disabled", true);
		const react = parseInt($("#react").val());
		const cmt = parseInt($("#cmt").val());
		const messages = parseInt($("#messages").val());
		const rows = table.rows().data();
		const newData = friendList.filter(e => (e.react <= react || isNaN(react)) && (e.cmt <= cmt || isNaN(cmt)) && (e.messages <= messages || isNaN(messages)));
		updateTable(newData, table);
		$("#search").prop("disabled", false);
	});
	$("#remove").click(async () => {
		$("#remove").prop("disabled", true);
		const allPages = table.cells().nodes();
		const nodes = $(allPages).find('input[type="checkbox"]:checked');
		swal.fire({
			icon: "info",
			title: "Đang xóa bạn bè . . .",
			html: "Đã xóa <b>0</b>/<b id='sum'>0</b> người bạn!",
			allowOutsideClick: false,
			allowEscapeKey: true,
			allowEnterKey: false,
			didOpen: () => {
				Swal.showLoading();
			},
			showCancelButton: true,
			cancelButtonText: "Dừng lại"
		}).then(result => {
			stop = true;
		});
		const content = Swal.getContent();
		content.querySelector("#sum").textContent = nodes.length;
		let count = 0;
		for (let i = 0; i < nodes.length; i++) {
			const id = $(nodes[i]).attr("id");
			friendList.splice(
				friendList.findIndex(e => e.id == id),
				1
			);
			$("#log").prepend(
				`<div class="alert alert-info" role="alert">Xóa id ${id} <p id="load${id}">[...]<p></div>`
			);
			removeFriend(id, token, fb_dtsg);
			$(`#load${id}`).html("[♥]");
			updateTable(friendList, table);
			content.querySelector("b").textContent = ++count;
			if (count == nodes.length) {
				swal.fire({
					icon: "success",
					title: "Thành công",
					text: `Đã xóa xong ${count}/${nodes.length} người bạn!`
				});
			}
			await utils.asyncWait(500);
		}
		$("#remove").prop("disabled", false);
	});
	$("#cancel").click(() => {
		$("#cancel").prop("disabled", true);
		updateTable(friendList, table);
		$("#cancel").prop("disabled", false);
	});
	$("#selectall").click(function() {
		const allPages = table.cells().nodes();
		if ($(this).hasClass("allChecked")) {
			$(allPages)
				.find('input[type="checkbox"]')
				.prop("checked", false);
		} else {
			$(allPages)
				.find('input[type="checkbox"]')
				.prop("checked", true);
		}
		$(this).toggleClass("allChecked");
	});
});
