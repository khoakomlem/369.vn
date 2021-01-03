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
    
});
// $('body').block({ 
//     message: '<div class="spinner-grow text-primary" role="status"><span class="sr-only">Loading...</span></div>',
//     timeout: 20000 
// }); 

$('#go').click(()=>{
    $('#log').html('');
    $('#log').append(`
        <div class="alert alert-warning mt-3" role="alert">
            Đang quét...
        </div>
    `);
    let link = $('#id').val();
    if(link == ""){
        alert('Lỗi');
        return;
    }
    let id = getidpost(link);
    id = 'S:_I'+id+':'+id;
    id = btoa(id);
    $.post('https://www.facebook.com/api/graphql/',{
        fb_dtsg: fb_dtsg,
        q: "node("+id+"){id,message,feedback{comments.first(1000).after(){page_info,nodes{id,author{id,name},body}}}}"
    }, data=>{
        data = JSON.parse(data);
        data = data[Object.keys(data)[0]].feedback.comments.nodes;
        output = '';
        data.forEach(data=>{
            output += data.author.id + ":" + data.body.text + "\n";
        });
        $('#log').append(`
            <div class="alert alert-info" role="alert">
                Đã quét xong. Đang tạo file download...
            </div>
        `);
        download('comments.txt', output);
    });
});
function formatNumber(num){
    return new Intl.NumberFormat().format(num);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}


function getidpost(link) {
    var id = null;
    var post = link.match(/(.*)\/posts\/([0-9]{8,})/);
    var photo = link.match(/(.*)\/photo.php\?fbid=([0-9]{8,})/);
    var photo2 = link.match(/(.*)\/photo\/\?fbid=([0-9]{8,})/);
    var video = link.match(/(.*)\/video.php\?v=([0-9]{8,})/);
    var story = link.match(/(.*)\/story.php\?story_fbid=([0-9]{8,})/);
    var permalink = link.match(/(.*)\/permalink.php\?story_fbid=([0-9]{8,})/);
    var number = link.match(/(.*)\/([0-9]{8,})/);
    var comment = link.match(/(.*)comment_id=([0-9]{8,})/);
    var media = link.match(/(.*)media\/set\/\?set=a\.([0-9]{8,})/);
    var watch = link.match(/(.*)\/watch\/\?v=([0-9]{8,})/);
    if (post) {
        id = post[2]
    } else {
        if (photo) {
            id = photo[2]
        } else {
            if (video) {
                id = video[2]
            } else {
                if (story) {
                    id = story[2]
                } else {
                    if (permalink) {
                        id = permalink[2]
                    } else {
                        if (number) {
                            id = number[2]
                        }else{
                            if (media) {
                                id = media[2]
                            }else{
                                if(watch){
                                    id = watch[2]
                                }else{
                                    if(photo2){
                                        id = photo2[2]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return id;
}