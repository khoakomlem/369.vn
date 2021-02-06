import * as utils from "../utils/index.js";

const fns = [
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/security/two_fac_auth?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660981`
			})
		).includes("uiInputLabelCheckbox");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/security/trusted_friends.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660987`
			})
		).includes("fbNoTrustedFriends");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/granular_privacy/composer.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660982`
			})
		).includes("sp_DAdeRiR4qdS");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/granular_privacy/can_friend_req.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660983`
			})
		).includes(`value="300645083384735"`);
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/granular_privacy/find_email.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660984`
			})
		).includes("sp_DAdeRiR4qdS");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/granular_privacy/find_phone.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660985`
			})
		).includes("sp_DAdeRiR4qdS");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/granular_privacy/search.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660986`
			})
		).includes("search_filter_public");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/timeline/review.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660988`
			})
		).includes("tag_approval_enabled");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/tagging/review.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660989`
			})
		).includes("tag_review_enabled");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/mobile/phones.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660990`
			})
		).includes("Coption value=");
	},
	async fb_dtsg_ag => {
		return (
			await $.ajax({
				url: `https://www.facebook.com/ajax/settings/subscribers/comment.php?__a=1&fb_dtsg_ag=${fb_dtsg_ag}&_=1608525660991`
			})
		).includes("commentsetting");
	}
];

const get_fb_dtsg_ag = async () => {
	const content = await $.ajax({
		url: "https://m.facebook.com/policies/",
		method: "GET"
	});
	return /"dtsg_ag":{"token":"(.*?)","valid_for"/.exec(content)[1];
};

$(document).ready(async () => {
	const fb_dtsg_ag = await get_fb_dtsg_ag();
	const data = [
		"Bảo mật phê duyệt",
		"Liên hệ tin cậy",
		"Thông tin cá nhân",
		"Thông tin kết bạn",
		"Thông tin Email",
		"Thông tin số điện thoại",
		"Cho phép các công cụ tìm kiếm",
		"Bảo mật dòng thời gian",
		"Đánh giá tag",
		"Kích hoạt mobilephone",
		"Bảo mật theo dõi"
	];
	const url = [
		"https://www.facebook.com/settings?tab=security&section=approvals&view",
		"https://www.facebook.com/settings?tab=security&section=trusted_friends&view",
		"https://www.facebook.com/settings?tab=privacy&section=composer&view",
		"https://www.facebook.com/settings?tab=privacy&section=canfriend&view",
		"https://www.facebook.com/settings?tab=privacy&section=findemail&view",
		"https://www.facebook.com/settings?tab=privacy&section=findphone&view",
		"https://www.facebook.com/settings?tab=privacy&section=search&view",
		"https://www.facebook.com/settings?tab=timeline&section=timeline_review&view",
		"https://www.facebook.com/settings?tab=timeline&section=tagreview&view",
		"https://www.facebook.com/settings?tab=mobile",
		"https://www.facebook.com/settings?tab=followers&section=comment&view"
	];
	let count = 0;
	for (let i = 0; i < data.length; i++) {
		const result = !(await fns[i](fb_dtsg_ag));
		if (result) count++;
		const percent = (count / data.length) * 100;
		$(".bar>div").css("width", percent + "%");
		if (percent < 10) {
			$("#dobaomat").html("Kém");
		} else if (percent < 30) {
			$("#dobaomat").html("Thấp");
		} else if (percent < 50) {
			$("#dobaomat").html("Thường");
		} else if (percent < 70) {
			$("#dobaomat").html("An toàn");
		} else {
			$("#dobaomat").html("Cao!");
		}
		$("#dobaomat").append(` (${Math.round(percent)}%)`);
		$("#table").append(
			`<tr>
				<td style="font-size: 110%;">${data[i]}</td>
				<td><button style="min-width:100px; font-size: 110%;" class="btn badge badge-${result ? 'primary' : 'danger'}">${result ? "An Toàn" : "Không An Toàn"}</button></td>
				<td><a class="btn btn-outline-info btn-sm" target = "_blank" href="${url[i]}" >Sửa thiết lập</a></td>
			</tr>`
		);
	}
});


/*
	<div class="alert alert-primary mt-3" role="alert">${
				data[i]
			}<a style="margin-left: 10px; cursor: pointer" href=${
				url[i]
			} target="_blank" class="badge badge-${
				result ? "info" : "danger"
			}">${result ? "An Toàn" : "Không An Toàn"}</a></div>
*/