$(document).ready(function () {
    init_plat_selector();
    init_datetime_picker();
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
        $('#sale_plat').append(option);
    }
    $('#sale_plat').selectpicker('refresh');
}


function init_datetime_picker() {
    var when = new Date();

    $('#room_pwd_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#room_pwd_date").datepicker('setDate', when);

    $('#electric_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#electric_date").datepicker('setDate', when);

    $('#water_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#water_date").datepicker('setDate', when);

    $('#gas_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#gas_date").datepicker('setDate', when);

    $('#net_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#net_date").datepicker('setDate', when);
}

function get_date_from_picker(picker_id) {
    var when = $(picker_id).datepicker('getDate');
    var year = when.getFullYear();
    var month = when.getMonth() + 1;
    var day = when.getDate();
    var fmt = year + "-" + month + "-" + day;
    return fmt;
}

$(document).on('click', '#add_room_btn', function () {
    var room_name = $("#room_name").val().trim();
    var sale_plat = $("#sale_plat").val().join(',');
    var room_pwd_date = get_date_from_picker('#room_pwd_date');
    var room_pwd = $("#room_pwd").val().trim();
    var rooter_name = $("#rooter_name").val().trim();
    var rooter_pwd = $("#rooter_pwd").val().trim();
    var wifi_name = $("#wifi_name").val().trim();
    var wifi_pwd = $("#wifi_pwd").val().trim();
    var electric_date = get_date_from_picker('#electric_date');
    var electric_fee = $("#electric_fee").val().trim();
    var water_date = get_date_from_picker('#water_date');
    var water_fee = $("#water_fee").val().trim();
    var gas_date = get_date_from_picker('#gas_date');
    var gas_fee = $("#gas_fee").val().trim();
    var net_date = get_date_from_picker('#net_date');
    var net_fee = $("#net_fee").val().trim();
    var room_desc = $("#room_desc").val().trim();

    if (room_name === '') {
        page_warn("Room name can't be empty");
        return;
    }

    if (sale_plat === '') {
        page_warn("Sale plat can't be empty");
        return;
    }

    $.ajax({
        url: '/add_room',
        type: 'post',
        data: {
            room_name: room_name,
            sale_plat: sale_plat,
            room_pwd_date: room_pwd_date,
            room_pwd: room_pwd,
            rooter_name: rooter_name,
            rooter_pwd: rooter_pwd,
            wifi_name: wifi_name,
            wifi_pwd: wifi_pwd,
            electric_date: electric_date,
            electric_fee: electric_fee,
            water_date: water_date,
            water_fee: water_fee,
            gas_date: gas_date,
            gas_fee: gas_fee,
            net_date: net_date,
            net_fee: net_fee,
            room_desc: room_desc
        },
        dataType: 'json',
        success: function (response) {
            add_room_callback(response);
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


function add_room_callback(response) {
    if (response.code !== 0) {
        page_error(response.msg);
        return;
    }

    // TODO: go to edit page
    window.location.replace('/');
}


$(document).on('click', '#go_home_btn', function () {
    window.location.replace('/');
});