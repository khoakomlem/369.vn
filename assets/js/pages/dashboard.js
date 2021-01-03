let token, name, uid, fb_dtsg;
let follow, group, friend;

$.get('https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed', async (data)=>{
    if(data[0] == '<'){
        $('body').html("Oops, Không thể get thông tin, vui lòng liên hệ Admin để biết thêm.");
        return;
    }
    // regex_token::Begin
    let pattern = /(?<=accessToken\\":\\")(.*?)(?=\\")/;
    let arr = pattern.exec(data);
    if(arr == null) token = prompt("Get token tự động đã bị lỗi vui lòng điền token của bạn vào đây: "); else
    token = (arr[0]);
    // regex_token::End

    // get_name&id::Begin
    await $.get('https://graph.facebook.com/me?access_token='+ token, (data)=>{
      uid = data.id;
      name = data.name;
      $('.name').html(name + "(" + uid + ")");
    });

    // get_name&id::End

    //regex_dtsg::Begin
    pattern = /(?<=fb_dtsg\\" value=\\")(.*?)(?=\\")/;
    arr = pattern.exec(data);
    if(arr == null) fb_dtsg = prompt("Nhập dtsg: "); else
    fb_dtsg = (arr[0]);
    //regex_dtsg::End

    $('#name').html(name);
    $('#avt').attr('src', 'https://graph.facebook.com/'+uid+'/picture?height=500&access_token=' + token);
    $.post('https://www.facebook.com/api/graphql/',{ //Get data web
        fb_dtsg: fb_dtsg,
        q: "node("+uid+"){friends{count},subscribers{count},groups{count},created_time,timeline_feed_units.first(100000000){page_info,edges{node{url,feedback{reactors{count},comments{count}}}}}}"
    }, (res)=>{
        res = JSON.parse(res)[uid];
        follow = res.subscribers.count;
        friend = res.friends.count;
        group  = res.groups.count;
        console.log(friend);
        chay();
    });
});
// $('body').block({ 
//     message: '<div class="spinner-grow text-primary" role="status"><span class="sr-only">Loading...</span></div>',
//     timeout: 20000 
// }); 
function chay(){
    $('.group').html(formatNumber(group));
    $('.follow').html(formatNumber(follow));
    $('.friend').html(formatNumber(friend));
}


function formatNumber(num){
    return new Intl.NumberFormat().format(num);
}