var first_array = [];
var second_array = [];

$(document).ready(function () {
    init_datetime_picker();
    init_room_state();
});

$(document).on('click', '.click_cell', function () {
    // Get selected info
    var this_id = $(this).attr('id');
    var twice = this_id.split('_');
    var this_plat = twice[0];
    var this_dt = twice[1];

    // First select
    if (!first_array[this_plat]) {
        first_array[this_plat] = this_dt;
        second_array[this_plat] = null;
        batch_select_date(this_plat, this_dt, this_dt);
        return;
    }
    var first_dt = first_array[this_plat];

    // Second select
    if (!second_array[this_plat]) {
        // Click the same plat and same dt
        if (first_dt === this_dt) {
            first_array[this_plat] = null;
            second_array[this_plat] = null;
            clear_all_calendar(this_plat);
            return;
        }

        // Click the same plat but different dt
        second_array[this_plat] = this_dt;
        batch_select_date(this_plat, first_dt, this_dt);
        return;
    }

    // Third select
    first_array[this_plat] = this_dt;
    second_array[this_plat] = null;
    batch_select_date(this_plat, this_dt, this_dt);
});

function clear_all_calendar(plat_id) {
    $("#calendar").find(".click_cell").each(function () {
        var this_id = $(this).attr('id');
        var twice = this_id.split('_');
        var this_plat = twice[0];
        if (plat_id === this_plat) {
            $(this).removeClass("selected_cell");
        }
    });
}

function batch_select_date(plat_id, start_dt, end_dt) {
    var start_date = new Date(start_dt);
    var end_date = new Date(end_dt);
    if (start_date > end_date) {
        var middle_date = start_date;
        start_date = end_date;
        end_date = middle_date;
    }

    $("#calendar").find(".click_cell").each(function () {
        var this_id = $(this).attr('id');
        var twice = this_id.split('_');
        var this_plat = twice[0];
        var this_dt = twice[1];

        if (this_plat !== plat_id) {
            return;
        }

        var this_date = new Date(this_dt);
        if (this_date >= start_date && this_date <= end_date) {
            $(this).addClass("selected_cell");
            return;
        }

        $(this).removeClass("selected_cell");
    });
}

function init_datetime_picker() {
    var now = new Date();

    $('#electric_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#start_date").datepicker('setDate', now);

    $('#water_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    var when = new Date();
    when.setDate(now.getDate() + 90);
    $("#end_date").datepicker('setDate', when);
}

function get_date_from_picker(picker_id) {
    var when = $(picker_id).datepicker('getDate');
    var year = when.getFullYear();
    var month = when.getMonth() + 1;
    var day = when.getDate();
    var fmt = year + "-" + month + "-" + day;
    return fmt;
}

function init_room_state() {
    $.ajax({
        url: '/room_state',
        type: 'get',
        data: {
            room_id: 4,
            start_dt: get_date_from_picker('#start_date'),
            end_dt: get_date_from_picker('#end_date')
        },
        dataType: 'json',
        success: function (response) {
            init_room_state_callback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 302) {
                window.location.replace('/');
            } else {
                console.log('error');
            }
        }
    });
}

function init_room_state_callback(response) {
    if (response.code !== 0) {
        console.log('error');
        return;
    }

    var content = response.content;
}

$(document).on('click', '#save_state_info', function () {
    $("#calendar").find(".click_cell").each(function () {
       if (!$(this).hasClass('selected_cell')) {
           return;
       }

       var this_id = $(this).attr('id');
       console.log(this_id);
    });
});