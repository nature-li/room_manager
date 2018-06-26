var login_user_name = null;
$(document).ready(function () {
    login_user_name = $("#user_name").val();
});

$(document).on('input', '#user_name', function() {
    var user_name = $("#user_name").val();
    if (user_name === '') {
        return;
    }

    if (user_name === login_user_name) {
        $("#exist_tips").html("");
        return;
    }

    $.ajax({
            url: '/get_user_count',
            type: "post",
            data: {
                'user_name': user_name
            },
            dataType: 'json',
            success: function (response) {
                handle_get_user_count(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace("/");
                } else {
                    page_error("Change user name failed")
                }
            }
        }
    );
});

function handle_get_user_count(data) {
    if (data.code !== 0) {
        return;
    }

    var user_count = data.count;
    if (user_count > 0) {
        $("#exist_tips").html('User name exists!');
    } else {
        $("#exist_tips").html("");
    }
}

$(document).on('click', '#change_user_name_btn', function () {
    var user_name = $("#user_name").val();
    if (user_name === '') {
        page_warn("User name is empty");
        return;
    }

    $.ajax({
            url: '/api_change_user_name',
            type: "post",
            data: {
                'user_name': user_name
            },
            dataType: 'json',
            success: function (response) {
                refresh_view(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace("/");
                } else {
                    page_error("Change user name failed")
                }
            }
        }
    );
});

function refresh_view(data) {
    if (data.code !== 0) {
        page_error(data.msg);
        return;
    }

    window.location.reload();
    page_success('修改成功');
}


$(document).on('click', '#change_user_pwd_btn', function () {
    var old_pwd = $("#old_pwd").val();
    var new_pwd = $("#new_pwd").val();
    var retype_new_pwd = $("#retype_new_pwd").val();

    if (old_pwd === '') {
        page_warn("Old password is empty");
        return;
    }

    if (new_pwd === '') {
        page_warn("New password is empty");
        return;
    }

    if (new_pwd !== retype_new_pwd) {
        page_warn("Two new passwords dost not match!");
        return;
    }

    $.ajax({
            url: '/api_change_user_pwd',
            type: "post",
            data: {
                'old_pwd': old_pwd,
                'new_pwd': new_pwd
            },
            dataType: 'json',
            success: function (response) {
                refresh_view(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace("/");
                } else {
                    page_error("Change user password failed")
                }
            }
        }
    );
});