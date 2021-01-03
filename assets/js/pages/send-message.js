import * as utils from "../utils/index.js";

globalThis.index = 0;
const sendMessage = async (ids, message) => {
	const errors = [];
	for (const id of ids) {
		index++;
		const params = {
			body: message,
			fb_dtsg: await utils.fb_dtsg(await utils.getData())
		};
		params[`ids[${id}]`] = id;
		try {
			$("#log").prepend(
				`<div id="${id}" class="alert alert-info mt-3" role="alert">${index}. Đang gửi tin nhắn tới ${id} [...]</div>`
			);
			await $.ajax({
				url: "https://m.facebook.com/messages/send/?icm=1&refid=12&ref=dbl",
				method: "POST",
				data: params
			});
			$(`#${id}`).html(`${index}. Đã gửi tin nhắn tới ${id} [♥]`);
			await utils.asyncWait(500);
		} catch (e) {
			errors.push(id);
		}
	}
	if (errors.length > 0) {
		alert("Đã gặp lỗi với 1 số id! Bạn có thể kiểm tra trong dev tool");
		for (const id of errors) console.log(id);
	}
};

const getFriendList = async token => {
	const {data} = await $.ajax({
		url: `https://graph.facebook.com/me/friends?limit=5000&fields=id&access_token=${token}`,
		method: "GET"
	});
	return data;
};

$(document).ready(async () => {
	const getData = await utils.getData();
	const token = await utils.token(getData);
	$("#ids").click(() => {
		const ids = $("#box")[0]
			.value.split("\n")
			.filter(e => e != "");
		sendMessage(ids, $("#message")[0].value);
	});
	$("#all").click(async () => {
		const ids = [];
		const friends = await getFriendList(token);
		for (const friend of friends) ids.push(friend.id);
		sendMessage(ids, $("#message")[0].value);
	});
});
