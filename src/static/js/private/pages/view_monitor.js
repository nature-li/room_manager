$(document).ready(function () {
    // 定时任务
    load_monitor_status();
    setInterval(load_monitor_status, 5000);
});

$(document).on('click', '#btn_back_home', function () {
    window.location.replace('/');
});

function load_monitor_status() {
    var service_id = $('#td_service_id').text();
    $.ajax({
            url: '/api_get_job_full_status',
            type: "post",
            data: {
                'service_id': service_id
            },
            dataType: 'json',
            success: function (response) {
                update_monitor_status(response);
            }
        }
    );
}

function get_img_from_healthy_code(healthy_code) {
    var img = '<img src="/static/images/white.png" alt="no data" data-toggle="tooltip" title="远程登录失败">';
    if (healthy_code === 1) {
        img = '<img src="/static/images/green.png" alt="success" data-toggle="tooltip" title="服务健康">';
    } else if (healthy_code === 2) {
        img = '<img src="/static/images/yellow.png" alt="warning" data-toggle="tooltip" title="执行命令或条件判断失败">';
    } else if (healthy_code === 3) {
        img = '<img src="/static/images/red.png" alt="error" data-toggle="tooltip" title="服务异常">';
    } else if (healthy_code === 4) {
        img = '<img src="/static/images/purple.png" alt="error" data-toggle="tooltip" title="发生严重错误请重启服务">';
    }
    return img;
}

function update_monitor_status(response) {
    if (response.code !== 0) {
        return
    }

    var monitor_time = response['monitor_time'];
    var healthy_code = response['healthy_code'];
    var command_healthy_code = response['command_healthy_code'];

    var img = get_img_from_healthy_code(healthy_code);
    $("#td_monitor_time").html(monitor_time);
    $("#td_monitor_status").html(img);

    var check_cmd_changed = false;
    var exist_cmd_count = 0;
    $('#tbl_body_healthy > tbody > tr').each(function () {
        var check_cmd_id = $(this).find("td:eq(0)").text();
        healthy_code = command_healthy_code[check_cmd_id];
        if (healthy_code === undefined) {
            check_cmd_changed = true;
        }
        exist_cmd_count++;

        var img = get_img_from_healthy_code(healthy_code);
        $(this).find("td:eq(1)").html(monitor_time);
        $(this).find("td:eq(2)").html(img);
    });

    $('#tbl_body_unhealthy > tbody > tr').each(function () {
        var check_cmd_id = $(this).find("td:eq(0)").text();
        healthy_code = command_healthy_code[check_cmd_id];
        if (healthy_code === undefined) {
            check_cmd_changed = true;
        }
        exist_cmd_count++;

        var img = get_img_from_healthy_code(healthy_code);
        $(this).find("td:eq(1)").html(monitor_time);
        $(this).find("td:eq(2)").html(img);
    });

    $("[data-toggle='tooltip']").tooltip();

    // reload page after 5 seconds
    if (check_cmd_changed || Object.keys(command_healthy_code).length !== exist_cmd_count) {
        setInterval(window.location.reload, 5000);
    }
}


$(document).on('click', '#btn_edit_monitor_detail', function () {
    var service_id = $('#td_service_id').text();
    window.location.replace('/edit_monitor_detail?service_id=' + service_id);
});
