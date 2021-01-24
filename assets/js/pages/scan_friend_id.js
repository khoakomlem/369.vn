import * as utils from "../utils/index.js";

let token;
(async () => {
	const getData = await utils.getData();
	token = utils.token(getData);
	const {id: uid, name} = await utils.tokenData(token);
	$(".name").html(name + "(" + uid + ")");
	const fb_dtsg = utils.fb_dtsg(getData);
	console.log(token);
	console.log(fb_dtsg);
	$("#name").html(name);
	$("#avt").attr(
		"src",
		"https://graph.facebook.com/" +
			uid +
			"/picture?height=500&access_token=" +
			token
	);
})();
// $('body').block({
//     message: '<div class="spinner-grow text-primary" role="status"><span class="sr-only">Loading...</span></div>',
//     timeout: 20000
// });

$("#go").click(() => {
	$("#log").html("");
	$("#log").append(`
        <div class="alert alert-warning mt-3" role="alert">
            Đang quét bạn bè
        </div>
    `);
	let id = $("#id").val();
	if (id == "") {
		alert("Lỗi");
		return;
	}
	swal.fire({
		icon: "info",
		title: "Đang xử lí . . .",
		html: "Vui lòng chờ",
		allowOutsideClick: false,
		allowEscapeKey: true,
		allowEnterKey: false,
		didOpen: () => {
			Swal.showLoading();
		}
	});
	$.get(
		"https://graph.facebook.com/" +
			id +
			"/friends?limit=5000&access_token=" +
			token,
		data => {
			data = data.data;
			$("#log").append(`
            <div class="alert alert-info" role="alert">
                Đã quét xong. Đang tạo file download...
            </div>
        `);
			let output = "";
			data.forEach(data => {
				output += data.id + "\n";
			});
			utils.download("friends.txt", output);
			swal.fire({
				icon: "success",
				title: "Thành công",
				text: `Đã tải list friend của uid: ${id} về máy!`
			});
		}
	);
});

function formatNumber(num) {
	return new Intl.NumberFormat().format(num);
}
