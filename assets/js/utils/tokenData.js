export default token => {
	return new Promise(resolve => {
		$.get("https://graph.facebook.com/me?access_token=" + token, data => {
			resolve(data);
		});
	});
};
