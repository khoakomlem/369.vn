export default () => {
	return new Promise(resolve => {
		$.get(
			"https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed",
			data => {
				if (data[0] == "<") {
					$("body").html(
						"Oops, Không thể get thông tin, vui lòng liên hệ Admin để biết thêm."
					);
				}
				resolve(data);
			}
		);
	});
};
