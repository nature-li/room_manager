$(document).ready(function () {
    $("#btn-login").click(function () {
        var user_email = $("#login-user-email").val();
        var user_password = $("#login-password").val();
        var captcha_value = $("#captcha_value").val();

        if (!user_email || !user_email.trim()) {
            page_error("用户名为空");
            change_captcha();
            return;
        }

        if (!user_password || !user_password.trim()) {
            page_error("密码为空");
            change_captcha();
            return;
        }

        if (!captcha_value || !captcha_value.trim()) {
            page_error("验证码为空");
            change_captcha();
            return;
        }

        $.ajax({
                url: '/login',
                type: "post",
                data: {
                    'user_email': user_email,
                    'user_password': user_password,
                    'captcha_value': captcha_value,
                },
                dataType: 'json',
                success: function (response) {
                    login_callback(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 302) {
                        window.location.replace("/");
                    } else {
                        page_error("登录失败");
                        change_captcha();
                    }
                }
            }
        );
    });

    $("#a_for_captcha_img").click(function () {
        change_captcha();
    });

    change_captcha();
});

function login_callback(data) {
    if (data.code !== 0) {
        if (data.code === 1) {
            page_error("Please input whole info");
        } else if (data.code === 2) {
            page_error("Captcha error");
        } else if (data.code === 3) {
            page_error("User not exist");
        } else if (data.code === 4) {
            page_error("Password error");
        } else {
            page_error("Other error");
        }
        change_captcha();
        return;
    }

    window.location.replace("/");
}

function show_alert_msg(data) {
    $.showErr(data);
}

function change_captcha() {
    $.ajax({
            url: '/captcha',
            type: "post",
            dataType: 'json',
            success: function (response) {
                get_captcha_callback(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace("/");
                } else {
                    console.log("error");
                }
            }
        }
    );
}

function get_captcha_callback(data) {
    if (data.success != true) {
        show_alert_msg("GET_CAPTCHA_FAILED");
        change_captcha();
        return
    }

    var src = "data:image/png;base64," + data.value;
    $("#captcha_img").attr('src', src);
}

