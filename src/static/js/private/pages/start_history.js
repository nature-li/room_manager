$(document).ready(function () {
    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // Init datetime picker
    init_datetime_picker();

    // 查询全部用户并更新列表
    query_and_update_view();

    // 定期更新数据
    setInterval(query_and_update_view, 5000);
});

// Init datetime picker
function init_datetime_picker() {
    $("#start_datetime").datetimepicker({
        language: 'zh-CN',
        format: "yyyy-mm-dd hh:ii",
        autoclose: true,
        todayBtn: true,
        pickerPosition: "bottom-left",
        todayHighlight: true
    });

    $("#end_datetime").datetimepicker({
        language: 'zh-CN',
        format: "yyyy-mm-dd hh:ii",
        autoclose: true,
        todayBtn: true,
        pickerPosition: "bottom-left",
        todayHighlight: true
    });

    // now
    var now_date = new Date();
    // yesterday
    var yesterday = new Date();
    yesterday.setDate(now_date.getDate() - 1);
    // tomorrow
    var tomorrow = new Date();
    tomorrow.setDate(now_date.getDate() + 1);

    // no datetime limit
    $("#start_datetime_value").val(format_date(yesterday));

    // start datetime limit
    $("#end_datetime").datetimepicker('setStartDate', format_date(yesterday));
    $("#end_datetime_value").val(format_date(tomorrow));
}


function zeroize(value, length) {
    if (!length) {
        length = 2;
    }

    value = String(value);
    for (var i = 0, zeros = ''; i < (length - value.length); i++) {
        zeros += '0';
    }

    return zeros + value;
}

function format_date(date) {
    var year = date.getFullYear();
    var month = zeroize(date.getMonth() + 1);
    var day = zeroize(date.getDate());
    var hour = zeroize(date.getHours());
    var minute = zeroize(date.getMinutes());

    return year + '-' + month + '-' + day + ' ' + hour + ":" + minute;
}

// 初始化全局变量
function reset_save_data() {
    window.save_data = {
        'item_list': [],
        'db_total_item_count': 0,
        'db_return_item_count': 0,
        'db_max_page_idx': 0,
        'view_max_page_count': 5,
        'view_item_count_per_page': 5,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0,
        'current_machine_id': null,
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    var start_str = $("#start_datetime_value").val() + ':00';
    var start_when = new Date(Date.parse(start_str.replace(/-/g, "/")));
    var start_time = start_when.getTime() / 1000;

    // Get end datetime
    var end_str = $("#end_datetime_value").val() + ':00';
    var end_when = new Date(Date.parse(end_str.replace(/-/g, "/")));
    var end_time = end_when.getTime() / 1000;

    $.ajax({
            url: '/api_query_start_history',
            type: "post",
            data: {
                'user_email': $("#search_user_email").val(),
                'off_set': off_set,
                'limit': limit,
                'start_time': start_time,
                'end_time': end_time
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

// 更新页表
function update_page_view(page_idx) {
    // 删除表格
    $('#start_history_result > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var history = window.save_data.item_list[i];
        add_row(history);
    }

    // 更新分页标签
    update_page_partition(page_idx);
}

function get_td_content(value) {
    return '<textarea class="form-control" rows="5" readonly>' + value + '</textarea>';
}

// Add machine to table
function add_row(history) {
    var table = $("#start_history_result");
    var tr = $(
        '<tr>' +
        '<td class="td-middle">' + history.id + '</td>' +
        '<td class="td-middle">' + history.user_email + '</td>' +
        '<td class="td-middle">' + history.service_name + '</td>' +
        '<td class="td-middle">' + history.ssh_user + '</td>' +
        '<td class="td-middle">' + history.ssh_ip + '</td>' +
        '<td class="td-middle">' + get_td_content(history.execute_cmd) + '</textarea></td>' +
        '<td class="td-middle">' + get_td_content(history.stdout) + '</textarea></td>' +
        '<td class="td-middle">' + get_td_content(history.stderr) + '</textarea></td>' +
        '<td class="td-middle">' + history.create_time + '</td>' +
        '<td class="td-middle">' + history.start_time + '</td>' +
        '<td class="td-middle">' + history.end_time + '</td>' +
        '</tr>');
    table.append(tr);
}

// Click search button
$(document).on('click', '#search_user_email', function () {
    reset_save_data();
    query_and_update_view();
});

$("#start_datetime_value").change(function () {
    // Get start datetime
    var start_str = $("#start_datetime_value").val() + ':00';
    var start_when = new Date(Date.parse(start_str.replace(/-/g, "/")));

    // Get end datetime
    var end_str = $("#end_datetime_value").val() + ':00';
    var end_when = new Date(Date.parse(end_str.replace(/-/g, "/")));

    // set the earliest start time
    $("#end_datetime").datetimepicker('setStartDate', format_date(start_when));
    if (end_when < start_when) {
        var one_day_later = start_when.setDate(start_when.getDate() + 1);
        $("#end_datetime_value").val(format_date(one_day_later));
    }
});

$(document).on('click', '#btn_back_home', function () {
   window.location.replace('/');
});