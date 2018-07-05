$(document).ready(function () {
    init_date_picker();
    init_plat_selector();

});

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

    return year + '-' + month + '-' + day;
}

function init_date_picker() {
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    $('#check_in_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    now.setDate(now.getDate() + 0);
    $("#check_in_date").datepicker('setDate', now);
}

$(document).on('input', '#order_desc', function () {
    var length = $('#order_desc').val().length;
    var tips = length + '/' + 1024;
    $("#order_desc_tips").html(tips);
});

function init_plat_selector() {
    $.ajax({
        url: '/room_plat',
        type: 'get',
        dataType: 'json',
        success: function (response) {
            init_plat_selector_callback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 302) {
                window.location.replace('/');
            } else {
                page_error('Occur error!');
            }
        }
    });
}

function init_plat_selector_callback(response) {
    if (response.code !== 0) {
        console.log('error');
        return;
    }

    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        var option = '<option value=' + item.id + '>' + item.plat_name + '</option>';
        $('#order_plat').append(option);
    }
    $('#order_plat').selectpicker('refresh');
}

$(document).on('click', '#add_order_btn', function () {
    var room_id = $("#room_id").val().trim();
    var plat_id = $("#order_plat").val().trim();
    var check_in_datetime = $('#check_in_date').datepicker('getDate');
    var check_out_datetime = $('#check_out_date').datepicker('getDate');
    var user_name = $("#user_name").val().trim();
    var order_fee = $("#order_fee").val().trim();
    var person_count = $("#person_count").val().trim();
    var phone = $("#phone").val().trim();
    var wechat = $("#wechat").val().trim();
    var order_desc = $("#order_desc").val().trim();

    if (!user_name) {
        page_warn("Customer name is empty!");
        return;
    }

    if (!order_fee) {
        page_warn("Order fee is empty!");
        return;
    }

    if (!room_id || !plat_id || !check_in_datetime || !check_out_datetime) {
        page_warn('Other errors!');
        return;
    }

    $.ajax({
        url: '/order',
        type: 'post',
        data: {
            room_id: room_id,
            plat_id: plat_id,
            check_in_date: format_date(check_in_datetime),
            check_out_date: format_date(check_out_datetime),
            user_name: user_name,
            order_fee: order_fee,
            person_count: person_count,
            phone: phone,
            wechat: wechat,
            order_desc: order_desc
        },
        dataType: 'json',
        success: function (response) {
            handle_add_order_callback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 302) {
                window.location.replace('/');
            } else {
                page_error('Occur error!');
            }
        }
    });
});

function handle_add_order_callback(response) {
    if (response.code !== 0) {
        page_error('保存失败');
        return;
    }

    page_success('保存成功');
}

$(document).on('change', '#check_in_date', function () {
    var check_in_date = $('#check_in_date').datepicker('getDate');
    if (!check_in_date) {
        return;
    }
    var when = new Date(check_in_date);
    when.setHours(0);
    when.setMinutes(0);
    when.setSeconds(0);

    var one_day_later = new Date(when);
    one_day_later.setDate(one_day_later.getDate() + 1);

    $('#check_out_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#check_out_date").datepicker('setStartDate', one_day_later);
    $("#check_out_date").datepicker('setDate', one_day_later);
});