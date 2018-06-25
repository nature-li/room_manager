var page_header_checked = false;
var page_check_id_dict = {};

$(document).ready(function () {
    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 查询全部用户并更新列表
    query_and_update_view();

    // 定时任务
    setInterval(reload_monitor_status, 5000);
});

// 初始化全局变量
function reset_save_data() {
    window.save_data = {
        'item_list': [],
        'db_total_item_count': 0,
        'db_return_item_count': 0,
        'db_max_page_idx': 0,
        'view_max_page_count': 5,
        'view_item_count_per_page': 10,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0,
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/api_query_monitor',
            type: "post",
            data: {
                'service_name': $("#search_service_name").val(),
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (response) {
                save_data_and_update_page_view(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.location.replace("/");
                } else {
                    $.showErr("查询失败");
                }
            }
        }
    );
}

function query_and_update_view_silent() {
    // Reset page_check_id_list
    page_check_id_dict = {};
    $('#service_list_result > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='monitor_list[]']");
        if ($check_box.prop('checked')) {
            var service_id = $(this).find("td:eq(1)").text();
            page_check_id_dict[service_id] = 1;
        }
    });

    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/api_query_monitor',
            type: "post",
            data: {
                'service_name': $("#search_service_name").val(),
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (response) {
                save_data_and_update_page_view(response);
            },
        }
    );
}

// 更新页表
function update_page_view(page_idx) {
    // 删除表格头
    $('#service_list_result > th  > tr').each(function () {
        $(this).remove();
    });
    // 增加表格头
    add_header();

    // 删除表格内容
    $('#service_list_result > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格内容
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var service = window.save_data.item_list[i];
        add_row(service);
    }
    $("[data-toggle='tooltip']").tooltip();

    // 重新勾选选择项: 选择头部
    if (page_header_checked === true) {
        $("#check_all").prop('checked', true);
    }
    // 重新勾选选择项: 选择内容
    $('#service_list_result > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='monitor_list[]']");
        var service_id = $(this).find("td:eq(1)").text();

        if (page_check_id_dict[service_id] === 1) {
            $check_box.prop('checked', true);
        }
    });

    // 更新分页标签
    update_page_partition(page_idx);
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

// 增加表格头
function add_header() {
    var page_right_txt = $.cookie('page_right');
    var page_right = parseInt(page_right_txt);

    var tr = '<tr>';
    if ((page_right & 0B010) !== 0) {
        tr += '<th style="text-align:center" width="20"><input id="check_all" type="checkbox" value=""></th>';
        tr += '<th style="text-align:center">ID</th>';
        tr += '<th style="text-align:center">用户</th>';
        tr += '<th style="text-align:center">服务名称</th>';
        tr += '<th style="text-align:center">管理账号</th>';
        tr += '<th style="text-align:center">监测状态</th>';
        tr += '<th style="text-align:center">启停监测</th>';
        tr += '<th style="text-align:center">监测时间</th>';
        tr += '<th style="text-align:center">健康状况</th>';
        tr += '<th style="text-align:center">查看</th>';
        tr += '<th style="text-align:center">编辑</th>';
    } else {
        tr += '<th style="text-align:center" width="20"><input id="check_all" type="checkbox" value=""></th>';
        tr += '<th style="text-align:center">ID</th>';
        tr += '<th style="text-align:center">用户</th>';
        tr += '<th style="text-align:center">服务名称</th>';
        tr += '<th style="text-align:center">管理账号</th>';
        tr += '<th style="text-align:center">监测状态</th>';
        tr += '<th style="text-align:center">监测时间</th>';
        tr += '<th style="text-align:center">健康状况</th>';
        tr += '<th style="text-align:center">查看</th>';
    }
    tr += '</tr>';
    $("#service_list_result > thead").html(tr);
}

function get_toggle_status(is_active) {
    var toggle_status = '<img src="/static/images/stop.png" alt="否">';
    if (is_active) {
        toggle_status = '<img src="/static/images/running.gif" alt="是">';
    }

    return toggle_status;
}

function get_toggle_button(is_active) {
    var toggle_button = '<button type="button" class="btn btn-default btn-xs monitor-play-button" data-toggle="tooltip" title="点我恢复监测">' +
        '<span class="glyphicon glyphicon-play"></span></button>';
    if (is_active) {
        toggle_button = '<button type="button" class="btn btn-default btn-xs monitor-pause-button" data-toggle="tooltip" title="点我暂停监测">' +
            '<span class="glyphicon glyphicon-pause"></span></button>';
    }
    return toggle_button;
}

// 在表格中增加用户
function add_row(service) {
    var page_right_txt = $.cookie('page_right');
    var page_right = parseInt(page_right_txt);

    var manager = service.ssh_user + '@' + service.ssh_ip + ':' + service.ssh_port;
    var toggle_status = get_toggle_status(service.is_active);
    var toggle_button = get_toggle_button(service.is_active);
    var img = get_img_from_healthy_code(service.healthy_code);

    var tr = '<tr>';
    if ((page_right & 0B010) !== 0) {
        tr += '<td style="text-align:center;"><input name="monitor_list[]" type="checkbox" value="' + service.id + '"></td>';
        tr += '<td style="text-align:center;">' + service.id + '</td>';
        tr += '<td style="text-align:center;">' + service.user_email + '</td>';
        tr += '<td style="text-align:center;">' + service.service_name + '</td>';
        tr += '<td style="text-align:center;">' + manager + '</td>';
        tr += '<td style="text-align:center">' + toggle_status + '</td>';
        tr += '<td style="text-align:center">' + toggle_button + '</td>';
        tr += '<td style="text-align:center;">' + service.monitor_time + '</td>';
        tr += '<td style="text-align:center;">' + img + '</td>';
        tr += '<td style="text-align:center;"><button type="button" class="btn btn-default btn-xs monitor-view-button">查看</button></td>';
        tr += '<td style="text-align:center;"><button type="button" class="btn btn-default btn-xs monitor-edit-button">编辑</button></td>';
    } else {
        tr += '<td style="text-align:center;"><input name="monitor_list[]" type="checkbox" value="' + service.id + '"></td>';
        tr += '<td style="text-align:center;">' + service.id + '</td>';
        tr += '<td style="text-align:center;">' + service.user_email + '</td>';
        tr += '<td style="text-align:center;">' + service.service_name + '</td>';
        tr += '<td style="text-align:center;">' + manager + '</td>';
        tr += '<td style="text-align:center">' + toggle_status + '</td>';
        tr += '<td style="text-align:center;">' + service.monitor_time + '</td>';
        tr += '<td style="text-align:center;">' + img + '</td>';
        tr += '<td style="text-align:center;"><button type="button" class="btn btn-default btn-xs monitor-view-button">查看</button></td>';
    }
    tr += '</tr>';
    $("#service_list_result").append(tr);
}

// 点击查找用户按钮
$(document).on("click", "#search_user_name_btn", function (e) {
    // 清空数据并设置查找账号
    reset_save_data();

    // 查询数据并更新页面
    query_and_update_view();
});


// 增加监测
$(document).on('click', '#add_service_button', function (e) {
    window.location.replace('/add_monitor');
});

// 暂停监测
$(document).on('click', '.monitor-pause-button', function (e) {
    var service_id = $(this).closest('tr').find('td:eq(1)').text();
    var expect_active = 0;
    async_set_monitor_active(service_id, expect_active);
});

// 激活监测
$(document).on('click', '.monitor-play-button', function (e) {
    var service_id = $(this).closest('tr').find('td:eq(1)').text();
    var expect_active = 1;
    async_set_monitor_active(service_id, expect_active);
});

function async_set_monitor_active(service_id, expect_active) {
    $.ajax({
            url: '/api_set_monitor_active',
            data: {
                'service_id': service_id,
                'expect_active': expect_active,
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                if (!response.success) {
                    $.showErr("更新失败");
                    return;
                }

                var content = response.content;
                if (content.length === 0) {
                    window.location.reload();
                    return;
                }


                // Refresh monitor row
                var a_service = content[0];
                refresh_monitor_row(a_service)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace('/');
                } else {
                    $.showErr('发生错误')
                }
            },
        }
    );
}


function refresh_monitor_row(service) {
    var page_right_txt = $.cookie('page_right');
    var page_right = parseInt(page_right_txt);

    $('#service_list_result > tbody > tr').each(function () {
        var page_service_id = $(this).find("td:eq(1)").text();
        if (page_service_id === service.id.toString()) {
            var manager = service.ssh_user + '@' + service.ssh_ip + ':' + service.ssh_port;
            var toggle_status = get_toggle_status(service.is_active);
            var toggle_button = get_toggle_button(service.is_active);
            var img = get_img_from_healthy_code(service.healthy_code);

            if ((page_right & 0B010) !== 0) {
                $(this).find('td:eq(2)').html(service.user_email);
                $(this).find('td:eq(3)').html(service.service_name);
                $(this).find('td:eq(4)').html(manager);
                $(this).find('td:eq(5)').html(toggle_status);
                $(this).find('td:eq(6)').html(toggle_button);
                $(this).find('td:eq(7)').html(service.monitor_time);
                $(this).find('td:eq(8)').html(img);
            } else {
                $(this).find('td:eq(2)').html(service.user_email);
                $(this).find('td:eq(3)').html(service.service_name);
                $(this).find('td:eq(4)').html(manager);
                $(this).find('td:eq(5)').html(toggle_status);
                $(this).find('td:eq(6)').html(service.monitor_time);
                $(this).find('td:eq(7)').html(img);
            }

            $("[data-toggle='tooltip']").tooltip();
        }
    });
}

$(document).on('click', '.monitor-view-button', function (e) {
    var service_id = $(this).closest('tr').find('td:eq(1)').text();
    var url = '/view_monitor?service_id=' + service_id;
    window.location.replace(url);
});

$(document).on('click', '.monitor-edit-button', function (e) {
    var service_id = $(this).closest('tr').find('td:eq(1)').text();
    var url = '/edit_monitor_detail?service_id=' + service_id;
    window.location.replace(url);
});

function reload_monitor_status() {
    query_and_update_view_silent();
}

// Select all checkbox
$(document).on('click', '#check_all', function () {
    if ($(this).prop('checked')) {
        page_header_checked = true;
        $("#service_list_result").find("input[name='monitor_list[]']").each(function (i, e) {
            $(e).prop('checked', true);
        })
    } else {
        page_header_checked = false;
        $("#service_list_result").find("input[name='monitor_list[]']").each(function (i, e) {
            $(e).prop('checked', false);
        })
    }
});

// Get selected service id
function get_selected_monitor_id() {
    var selected_monitor_id = [];
    $('#service_list_result > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='monitor_list[]']");
        if ($check_box.prop('checked')) {
            var service_id = $(this).find("td:eq(1)").text();
            selected_monitor_id.push(service_id);
        }
    });
    return selected_monitor_id;
}

// Batch start
$(document).on('click', '#batch_start_button', function () {
    var selected_monitor_id = get_selected_monitor_id();
    if (selected_monitor_id.length === 0) {
        return;
    }

    $.showConfirmArgs("您确定要批量启动服务吗?", batch_start_stop_service, 'start');
});

// Batch stop
$(document).on('click', '#batch_stop_button', function () {
    var selected_monitor_id = get_selected_monitor_id();
    if (selected_monitor_id.length === 0) {
        return;
    }

    $.showConfirmArgs("您确定要批量停止服务吗?", batch_start_stop_service, 'stop');
});

// Batch restart
$(document).on('click', '#batch_restart_button', function () {
    var selected_monitor_id = get_selected_monitor_id();
    if (selected_monitor_id.length === 0) {
        return;
    }

    $.showConfirmArgs("您确定要批量重启服务吗?", batch_start_stop_service, 'restart');
});

// Batch operate
function batch_start_stop_service(action) {
    var selected_monitor_id = get_selected_monitor_id();
    if (selected_monitor_id.length === 0) {
        return;
    }

    $.ajax({
            url: '/api_start_stop_service',
            type: "post",
            data: {
                'service_id': selected_monitor_id.join(),
                'action': action,
            },
            dataType: 'json',
            success: function (response) {
                handle_batch_operate_result(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.location.replace("/");
                } else {
                    $.showErr("下发命令失败");
                }
            }
        }
    );
}

// Handle batch operate result
function handle_batch_operate_result(response) {
    if (response['code'] !== 0) {
        $.showErr("执行命令失败");
    } else {
        $('#check_all').prop('checked', false);
        $("#service_list_result").find("input[name='monitor_list[]']").each(function (i, e) {
            $(e).prop('checked', false);
        });

        window.location.replace('/start_history')
    }
}