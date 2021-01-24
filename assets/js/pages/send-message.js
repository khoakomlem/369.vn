import * as utils from "../utils/index.js";

globalThis.index = 0;
const sendMessage = async (ids, message) => {
	const errors = [];
	const fileUpload = $("#file");
	if (parseInt(fileUpload.get(0).files.length) > 3) {
		alert("Bạn chỉ được upload tối đa 3 ảnh");
		return;
	}
	let stop = false;
	swal.fire({
		icon: "info",
		title: "Đang gửi tin nhắn . . .",
		html: "Đã gửi cho <b>0</b>/<b id='sum'>0</b> người!",
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
	content.querySelector("#sum").textContent = ids.length;
	let count = 0;
	for (const id of ids) {
		try {
			const data = new FormData();
			const _index = ++index;
			data.append("fb_dtsg", await utils.fb_dtsg(await utils.getData()));
			data.append("ids", id);
			data.append("body", message);
			for (let i = 0; i < fileUpload[0].files.length; i++) {
				data.append("file" + (i + 1), fileUpload[0].files[i]);
			}
			const uniqid = Date.now();
			$("#log").prepend(
				`<div id="${uniqid}" class="alert alert-info mt-3" role="alert">${_index}. Đang gửi tin nhắn tới ${id} [...]</div>`
			);
			await $.ajax({
				url:
					"https://upload.facebook.com/_mupload_/mbasic/messages/attachment/photo/",
				method: "POST",
				processData: false,
				contentType: false,
				data
			});
			$(`#${uniqid}`).html(`${_index}. Đã gửi tin nhắn tới ${id} [♥]`);
			content.querySelector("b").textContent = ++count;
			if (count == ids.length) {
				swal.fire({
					icon: "success",
					title: "Thành công",
					text: `Đã gửi tin nhắn cho ${count}/${ids.length} người!`
				});
			}
			await utils.asyncWait(500);
		} catch (e) {
			errors.push(`ID: ${id} \nerror:${e.stack}`);
		}
	}
	if (errors.length > 0) {
		alert(
			`Đã gặp ${errors.length} lỗi! Bạn có thể kiểm tra trong dev tool (F12)`
		);
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
