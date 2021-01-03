export default data => {
    const arr = /(?<=accessToken\\":\\")(.*?)(?=\\")/.exec(data);
    return (arr == null) ? prompt("Get token tự động đã bị lỗi hoặc chưa đăng nhập, vui lòng điền token của bạn vào đây: ") : arr[0];
};