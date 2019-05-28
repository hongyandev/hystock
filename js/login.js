$(function () {
    if (navigator.appName == "Microsoft Internet Explorer" &&
        (navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE6.0" ||
            navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE7.0" ||
            navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0")
    ) {
        alert("您的浏览器版本过低，请使用360安全浏览器的极速模式或IE9.0以上版本的浏览器");
    }

    var _hmt = _hmt || [];
    (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?71559c3bdac3e45bebab67a5a841c70e";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    })();


});

$(function () {
    $(".login").height($(window).height());

    $('#password').keyup(function (event) {
        if (event.keyCode == "13") {
            $("#login").trigger("click");
            return false;
        }
    });

    $("#login").on("click", function () {
        submitForm();
    });

    function submitForm() {
        if (navigator.appName == "Microsoft Internet Explorer" &&
            (navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE6.0" ||
                navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE7.0" ||
                navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0")
        ) {
            alert("您的浏览器版本过低，请使用360安全浏览器的极速模式或IE9.0以上版本的浏览器");
        } else {
            var formData = {
                khdm : $('#khdm').val(),
                username: $('#username').val(),
                password: $('#password').val()

            };
            $.ajax({
                type: 'POST',
                url: genAPI('account/login'),
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(formData),
                success: function (res) {
                    if (res.code == 200) {
                        //console.info(res);
                        $.cookie('jwt',res.data.jwt);
                        $.cookie('khdm',res.data.user.khdm);
                        $.cookie('realName',res.data.user.realName);
                        $.cookie('uid',res.data.user.uid);
                        $.cookie('username',res.data.user.username);

                        location.href='index.html'
                    } else {
                        $('#myModal').modal();
                        //alert("用户名或密码错误！");
                    }
                },
                error: function () {

                }
            });
        }
    }

    $("#reset").on("click", function () {
        $("#username").val("");
        $("#password").val("");
    });
});