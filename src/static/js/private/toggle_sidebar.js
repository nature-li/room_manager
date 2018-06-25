// 隐藏侧边栏
$(".side-bar-hidden").click(function (e) {
    $("#wrapper").removeClass("toggled");
    $("#expand-side-bar").removeClass("hidden-self");
    $.cookie("pin_nav", 0);
});

// 点击菜单条件隐藏侧边栏
$(".side-bar-condition-hidden").click(function (e) {
    if ($("#lock-side-bar").hasClass("glyphicon-pushpin")) {
        $("#wrapper").removeClass("toggled");
        $("#expand-side-bar").removeClass("hidden-self");
        $.cookie("pin_nav", 0);
    }
});

// 展示侧边栏
$(".side-bar-show").click(function (e) {
    $("#wrapper").addClass("toggled");
    $("#expand-side-bar").addClass("hidden-self");
    $.cookie("pin_nav", 1);
});

// 切换浮动锁
$("#lock-side-bar").click(function (e) {
    if ($("#lock-side-bar").hasClass("glyphicon-pushpin")) {
        $("#lock-side-bar").removeClass("glyphicon-pushpin");
        $("#lock-side-bar").addClass("glyphicon-lock");
        $.cookie("pin_lock", 1);
    } else {
        $("#lock-side-bar").removeClass("glyphicon-lock");
        $("#lock-side-bar").addClass("glyphicon-pushpin");
        $.cookie("pin_lock", 0);
    }
});

// 点击非菜单条件隐藏侧边栏
$(document).click(function (event) {
    if ($("#lock-side-bar").hasClass("glyphicon-pushpin")) {
        if (!$(event.target).closest("#sidebar-wrapper, #expand-side-bar").length) {
            if ($("#wrapper").hasClass("toggled")) {
                $("#wrapper").removeClass("toggled");
                $("#expand-side-bar").removeClass("hidden-self");
                $.cookie("pin_nav", 0);
            }
        }
    }
});

// 点击服务列表
$("#service_list_menu").click(function (e) {
    window.location.replace("/monitor_list");
});

// 点击用户列表
$("#user_list_menu").click(function (e) {
    window.location.replace("/user_list");
});

// 点击机器列表
$("#machine_list_menu").click(function () {
    window.location.replace("/machine_list");
});

// 点击启动记录
$("#start_history_menu").click(function () {
    window.location.replace("/start_history");
});