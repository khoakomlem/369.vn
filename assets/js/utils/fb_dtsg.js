export default data => {
    const arr = /(?<=fb_dtsg\\" value=\\")(.*?)(?=\\")/.exec(data);
    return (arr == null) ? prompt("Nhập dtsg: ") : arr[0];
}