
let token, uid, name, fb_dtsg, birth;
$.get('https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed',async function(data){
    
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
      birth = data.birthday;
    });

    // get_name&id::End

    //regex_dtsg::Begin
    pattern = /(?<=fb_dtsg\\" value=\\")(.*?)(?=\\")/;
    arr = pattern.exec(data);
    if(arr == null) fb_dtsg = prompt("Nhập dtsg: "); else
    fb_dtsg = (arr[0]);
    $('button').removeAttr("disabled");
    $('button').attr("id","run");
    //regex_dtsg::End
});
let info = [];
$.get('https://m.facebook.com/ntdelegatescreen/?params=%7B%22entry-point%22%3A%22settings%22%7D&path=%2Fcontacts%2Fmanagement%2F', (data)=>{
    let pattern = /(?<=;color: #050505" id="......" data-nt="FB:TEXT4">)(.*?)(?=<\/div><div class="_a5o _9_7 _2rgt _1j-f _2rgt")/g;
    let arr; // Đoạn dưới là regex + check email và sdt
    do{
        arr = pattern.exec(data);
        if(arr == null) break;
        if(arr[0].indexOf("div") != -1) continue;
        if(arr[0].indexOf("&#064;") != -1)
            info.push(arr[0].split("&#064;").join("@"));
        else{
            let sdt = arr[0];
            let flag = 1;
            for(let i = 0; i < sdt.length; i++){
                if(sdt[i] != ' ' && sdt[i] != '-' && sdt[i] != '+' && !(sdt[i] >= '0' && sdt[i] <= '9')){
                    flag = 0;
                    break;
                }
            }
            if(flag == 1){
                info.push(sdt);
            }
        }
    }while(arr);

    pattern = /(?<=;color: #050505" id="....." data-nt="FB:TEXT4">)(.*?)(?=<\/div><div class="_a5o _9_7 _2rgt _1j-f _2rgt")/g;
    arr;
    do{
        arr = pattern.exec(data);
        if(arr == null) break;
        if(arr[0].indexOf("div") != -1) continue;
        if(arr[0].indexOf("&#064;") != -1)
            info.push(arr[0].split("&#064;").join("@"));
        else{
            let sdt = arr[0];
            let flag = 1;
            for(let i = 0; i < sdt.length; i++){
                if(sdt[i] != ' ' && sdt[i] != '-' && sdt[i] != '+' && !(sdt[i] >= '0' && sdt[i] <= '9')){
                    flag = 0;
                    break;
                }
            }
            if(flag == 1){
                info.push(sdt);
            }
        }
    }while(arr);
    console.log(info);
});
let friends = []
let backup = {}
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}
var currentdate = new Date(); 
let now = currentdate.timeNow() + " " + currentdate.today();
let ret;
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
function toTimestamp(year,month,day,hour,minute,second){
    var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
    return datum.getTime()/1000;
}
function escapeHtml(text) {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'");
  }
let cmt = [];
$('#backup_cmt').on('click',async ()=>{
    toastr.info("Đang tạo file download...","Info");
    let num_month = 3; // Số tháng gần nhất cần lấy

    let date = new Date();
    let month = date.getMonth() + 1;
    let now = Math.round(new Date().getTime()/1000);
    let pre = toTimestamp(date.getFullYear(), month - 1, 1, 0,0,0);
    
    await $.get('https://m.facebook.com/'+uid+'/allactivity?timeend='+now+'&timestart='+pre+'&log_filter=cluster_116&filter_onlyme', function(data){
        let pat = /(?<=div class="_56d4"><span>)(.*?)(?=<\/span><\/div>)/g;
        let ret;
        let loop = 0;
        do{
            ret = pat.exec(data);
            if(!ret) break;
            ret[0] = escapeHtml(ret[0]);
            cmt.push(ret[0].replace(/<[^>]*>/g, ""));
        }while(ret != null);
    });
        for(let i = 0; i < num_month - 1; i++){
            now = pre;
            pre -= 2592000; // 2592000 = 1 month
            await $.get('https://m.facebook.com/'+uid+'/allactivity?timeend='+now+'&timestart='+pre+'&log_filter=cluster_116&filter_onlyme', function(data){
            let pat = /(?<=div class="_56d4"><span>)(.*?)(?=<\/span><\/div>)/g;
            let ret;
            let loop = 0;
            do{
                ret = pat.exec(data);
                if(!ret) break;
                ret[0] = escapeHtml(ret[0]);
                cmt.push(ret[0].replace(/<[^>]*>/g, ""));
            }while(ret != null);
        });
    }
    console.log(JSON.stringify(cmt));
    callback_cmt();
});

$('#run').click(async ()=>{
    if($('button').attr('disabled') == "true") return;
    toastr.info("Bắt đầu get dữ liệu...","Info");
    await $.get('https://graph.facebook.com/me/friends?limit=5001&access_token=' + token,(res)=>{
        let {data} = res;
        friends = data;
    });
    let timed = 0;
    await friends.forEach( async friend => {
        await setTimeout(async ()=>{
            await $.get('https://graph.facebook.com/' + friend.id + '/photos?fields=source&limit=100000&access_token=' + token, (res)=>{
                let {data} = res;
                if(data.length > 0){
                    backup[friend.id] = {
                        name: friend.name,
                        data: []
                    }
                    data.forEach(c =>{
                        backup[friend.id]["data"].push(c.source);
                    });
                }
            });
        },timed * 500);
        timed++;
        
    });
    callback();
    
});
function callback_cmt(){
    toastr.success("Đã lấy thành công dữ liệu","Success");
    let ret = {
        name: name,
        id: uid,
        date_backup: now,
        data: cmt,
        birth: birth,
        info: JSON.stringify(info)
    };
    toastr.info("Đang tạo file download...","Info");
    setTimeout(()=>{
        let template = `<html>
        <head>
            <title>Backup data</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
            <style>
                .ten:hover{
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container mt-3">
                <div class="row">
                    <div class="col-4">
                        <div class="card" >
                            <div class="card-header">
                                Thông tin
                            </div>
                            <div class="card-body">
                                <span class="text-primary">Tên</span>: <span style="color: #000;" class="name"> Loading... </span>
                                <br>
                                <span class="text-primary">Ngày sinh</span>: <span class="birth"></span>
                                <br>
                                <span class="text-primary">Số comment</span>: <span class="num_frs">Loading...</span>
                                <br>
                                <span class="text-primary">Thời gian backup</span>: <span class="time"></span>
                                <span class="text-primary">Thông tin</span>: <span class="info"></span>
                                <br>
                                
                                <span class="text-danger">
                                    Lưu ý:
                                </span>
                                File backup này hoạt động tốt từ 2-3 tháng kể từ khi backup. Sau 3 tháng có thể sẽ không hiển thị ảnh
                            </div>
                        </div>
                    </div>
                    <div class="col-8" style="visibility: hidden;">
                        <div class="card">
                            <div class="card-header">
                                Bạn bè (<span class="num_frs">0</span>)
                            </div>
                            <div class="card-body">
                                <div class="mt-3 pl-3 khung" style="height: 200px; overflow: auto; border: 1px solid black;">
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 mt-2 mb-5">
                        <div class="card">
                            <div class="card-header">
                                Comment (<span class="num_frs"></span>)
                            </div>
                            <div class="container card-body">
                                <div class="row anh px-3">
                                    <input type="text" class="form-control" style="width: 100%;" placeholder="Tìm kiếm">
                                    <div class="mt-3 pl-3 khung" style="height: 200px; overflow: auto; width: 100%; border: 1px solid black;">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                let data = `+JSON.stringify(ret)+`
                
            </script>
            <script>
                $('.name').html(data.name+" ("+data.id+")");
                $('.num_frs').html(Object.keys(data.data).length);
                $('.time').html(data.date_backup);
                $('.birth').html(data.birth);
                $('.info').html(data.info);
                Object.keys(data.data).forEach(index=>{
                    let backup = data.data[index];
                    $('.khung').append("<p class='text-primary ten' onclick='showImg("+index+")'>"+backup+"</p>");
                });
                $('input').on("keyup", ()=>{
                    $('.khung').html('');
                    let inp = $('input').val();
                    console.log(inp);
                    Object.keys(data.data).forEach(index=>{
                        let backup = data.data[index];
                        if(backup.indexOf(inp) != -1 || inp == "")
                            $('.khung').append("<p class='text-primary ten' onclick='showImg("+index+")'>"+backup+"</p>");
                    });
                });
                function showImg(id){
                    $('.anh').html('');
                    user = data.data[id].data;
                    user.forEach(image => {
                        $('.anh').append('<div class="col-3 mt-2"><img class="img-thumbnail" src="'+image+'" alt=""></div>');
                    });
                }
            </script>
        </body>
        </html>;`;
        download("backup_"+uid+"_comment.html", template);
    },1000);
}
function callback(){
    toastr.success("Đã lấy thành công dữ liệu","Success");
    ret = {
        name: name,
        id: uid,
        date_backup: now,
        data: backup,
        birth: birth,
        info: JSON.stringify(info)
    };
    toastr.info("Đang tạo file download...","Info");
    setTimeout(()=>{
        let template = `<html>
    <head>
        <title>Backup data</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
        <style>
            .ten:hover{
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="container mt-3">
            <div class="row">
                <div class="col-4">
                    <div class="card" >
                        <div class="card-header">
                            Thông tin
                        </div>
                        <div class="card-body">
                            <span class="text-primary">Tên</span>: <span style="color: #000;" class="name"> Loading... </span>
                            <br>
                            <span class="text-primary">Ngày sinh</span>: <span class="birth"></span>
                            <br>
                            <span class="text-primary">Số bạn bè</span>: <span class="num_frs">Loading...</span>
                            <br>
                            <span class="text-primary">Thời gian backup</span>: <span class="time"></span>
                            <span class="text-primary">Thông tin</span>: <span class="info"></span>
                            <br>
                            
                            <span class="text-danger">
                                Lưu ý:
                            </span>
                            File backup này hoạt động tốt từ 2-3 tháng kể từ khi backup. Sau 3 tháng có thể sẽ không hiển thị ảnh
                        </div>
                    </div>
                </div>
                <div class="col-8">
                    <div class="card">
                        <div class="card-header">
                            Bạn bè (<span class="num_frs">0</span>)
                        </div>
                        <div class="card-body">
                            <input type="text" class="form-control" style="width: 100%;" placeholder="Tìm kiếm">
                            <div class="mt-3 pl-3 khung" style="height: 200px; overflow: auto; border: 1px solid black;">
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 mt-5 mb-5">
                    <div class="card">
                        <div class="card-header">
                            Ảnh
                        </div>
                        <div class="container card-body">
                            <div class="row anh">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            let data = `+JSON.stringify(ret)+`
            
        </script>
        <script>
            $('.name').html(data.name+" ("+data.id+")");
            $('.num_frs').html(Object.keys(data.data).length);
            $('.time').html(data.date_backup);
            $('.birth').html(data.birth);
            $('.info').html(data.info);
            Object.keys(data.data).forEach(index=>{
                let backup = data.data[index];
                $('.khung').append("<p class='text-primary ten' onclick='showImg("+index+")'>"+backup.name+"</p>");
            });
            $('input').on("keyup", ()=>{
                $('.khung').html('');
                let inp = $('input').val();
                Object.keys(data.data).forEach(index=>{
                    let backup = data.data[index];
                    if(backup.name.indexOf(inp) != -1 || inp == "")
                        $('.khung').append("<p class='text-primary ten' onclick='showImg("+index+")'>"+backup.name+"</p>");
                });
            });
            function showImg(id){
                $('.anh').html('');
                user = data.data[id].data;
                user.forEach(image => {
                    $('.anh').append('<div class="col-3 mt-2"><img class="img-thumbnail" src="'+image+'" alt=""></div>');
                });
            }
        </script>
    </body>
    </html>;`;
        download("backup_"+uid+".html", template);
    },7000);
}

