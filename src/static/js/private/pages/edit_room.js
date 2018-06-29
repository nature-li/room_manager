var old_start_dt = null;
var old_end_dt = null;

$(document).ready(function () {
    init_datetime_picker();
    init_room_state();
});

$(document).on('click', '.click_cell', function () {
    if ($(this).hasClass('selected_cell')) {
        $(this).removeClass('selected_cell');
    } else {
        $(this).addClass('selected_cell');
    }
});

function init_datetime_picker() {
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    $('#start_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    now.setDate(now.getDate() + 0);
    $("#start_date").datepicker('setDate', now);

    $('#end_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });

    $("#end_date").datepicker('setStartDate', now);
    var when = new Date(now);
    when.setDate(when.getDate() + 30);
    $("#end_date").datepicker('setDate', when);
    var last_date = new Date(now);
    last_date.setDate(last_date.getDate() + 90);
    $("#end_date").datepicker('setEndDate', last_date);
}


function format_date(when) {
    var year = when.getFullYear();
    var month = when.getMonth() + 1;
    var day = when.getDate();

    var fmt = year;
    if (month < 10) {
        fmt += '-0' + month;
    } else {
        fmt += '-' + month;
    }

    if (day < 10) {
        fmt += '-0' + day;
    } else {
        fmt += '-' + day;
    }
    return fmt;
}

function init_room_state() {
    var start_date = $('#start_date').datepicker('getDate');
    var end_date = $('#end_date').datepicker('getDate');
    $.ajax({
        url: '/room_state',
        type: 'get',
        data: {
            room_id: 1,
            start_dt: format_date(start_date),
            end_dt: format_date(end_date)
        },
        dataType: 'json',
        success: function (response) {
            init_room_state_callback(response, start_date, end_date);
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

function init_room_state_callback(response, start_date, end_date) {
    if (response.code !== 0) {
        console.log('error');
        return;
    }

    var start_week_day = start_date.getDay();
    var before_start_date = new Date(start_date);
    before_start_date.setDate(before_start_date.getDate() - start_week_day);

    var end_week_day = end_date.getDay();
    var after_end_date = new Date(end_date);
    after_end_date.setDate(after_end_date.getDate() + (6 - end_week_day));

    var milliseconds = after_end_date.getTime() - before_start_date.getTime();
    var days = Math.round(milliseconds / 24 / 3600 / 1000);
    days += 1;

    $("#calendar").html("");
    add_table_header();

    var loop = days / 7;
    var content = response.content;
    for (var loop_idx = 0; loop_idx < loop; loop_idx++) {
        add_week_group(content, before_start_date, start_date, end_date, loop_idx);
    }
}

function add_table_header() {
    var row = '';
    row += '<div class="div_row">';
    row += '<div class="week_box div_cell"><span>日</span></div>';
    row += '<div class="week_box div_cell"><span>一</span></div>';
    row += '<div class="week_box div_cell"><span>二</span></div>';
    row += '<div class="week_box div_cell"><span>三</span></div>';
    row += '<div class="week_box div_cell"><span>四</span></div>';
    row += '<div class="week_box div_cell"><span>五</span></div>';
    row += '<div class="week_box div_cell"><span>六</span></div>';
    row += '</div>';
    $("#calendar").append(row);
}

function add_week_group(content, before_start_date, start_date, end_date, loop_idx) {
    // Add week row
    add_week_row(before_start_date, start_date, end_date, loop_idx);

    // Add plat info
    Object.keys(content).forEach(function (plat_id) {
        var state_info = content[plat_id];
        var plat_name = state_info['plat_name'];
        add_state_row(before_start_date, start_date, end_date, loop_idx, plat_id, plat_name, state_info);
    });
}

function add_week_row(before_start_date, start_date, end_date, loop_idx) {
    var row = '';
    row += '<div class="div_row">';
    for (var i = 0; i < 7; i++) {
        var span = loop_idx * 7 + i;
        var when = new Date(before_start_date);
        when.setDate(before_start_date.getDate() + span);

        if (when < start_date || when > end_date) {
            row += '<div class="empty_date_box div_cell"><span></span></div>';
        } else {
            var dt = format_date(when);
            row += '<div class="date_box div_cell"><span>' + dt + '</span></div>';
        }
    }
    row += '</div>';

    $("#calendar").append(row);
}

function add_state_row(before_start_date, start_date, end_date, loop_idx, plat_id, plat_name, state_info) {
    var row = '';
    row += '<div class="div_row">';
    for (var i = 0; i < 7; i++) {
        var span = loop_idx * 7 + i;
        var when = new Date(before_start_date);
        when.setDate(before_start_date.getDate() + span);

        var dt = format_date(when);
        var div_id = plat_id + '_' + dt;

        if (when < start_date || when > end_date) {
            row += '<div id="' + div_id + '"class="empty_plat_box div_cell"><span></span></div>';
        } else {
            var state = state_info.state[dt];
            if (state === 1) {
                row += '<div id="' + div_id + '" class="plat_box div_cell click_cell selected_cell"><span>' + plat_name + '</span></div>';
            } else if (state === 2) {
                row += '<div id="' + div_id + '" class="plat_box div_cell click_cell selected_cell"><span>' + plat_name + '</span></div>';
            } else {
                row += '<div id="' + div_id + '" class="plat_box div_cell click_cell"><span>' + plat_name + '</span></div>';
            }
        }
    }
    row += '</div>';
    $("#calendar").append(row);
}

$(document).on('change', '#start_date', function () {
    var start_date = $('#start_date').datepicker('getDate');
    if (!start_date) {
        return;
    }

    var start_dt = format_date(start_date);
    if (old_start_dt === null || old_start_dt === start_dt) {
        old_start_dt = start_dt;
        return;
    }
    old_start_dt = start_dt;

    var end_date = $('#end_date').datepicker('getDate');
    if (!end_date) {
        return;
    }

    $("#end_date").datepicker('setStartDate', start_date);
    var when = new Date(old_start_dt);
    when.setDate(when.getDate() + 30);
    $("#end_date").datepicker('setDate', when);
    var last_date = new Date(start_date);
    last_date.setDate(last_date.getDate() + 90);
    $("#end_date").datepicker('setEndDate', last_date);

    init_room_state();
});

$(document).on('change', '#end_date', function () {
    var end_date = $('#end_date').datepicker('getDate');
    if (!end_date) {
        return;
    }
    var end_dt = format_date(end_date);
    if (old_end_dt === null || old_end_dt === end_dt) {
        old_end_dt = end_dt;
        return;
    }
    old_end_dt = end_dt;

    var start_date = $('#start_date').datepicker('getDate');
    if (!start_date) {
        return;
    }
    if (start_date > end_date) {
        return;
    }

    init_room_state();
});

$(document).on('click', '#save_state_info', function () {
    var states = {};

    $("#calendar").find(".click_cell").each(function () {
        var this_id = $(this).attr('id');
        if (!$(this).hasClass('selected_cell')) {
            states[this_id] = 0;
        } else {
            states[this_id] = 1;
        }
    });


    $.ajax({
        url: '/room_state',
        type: 'post',
        data: {
            room_id: 1,
            states: JSON.stringify(states)
        },
        dataType: 'json',
        success: function (response) {
            save_state_info_callback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 302) {
                window.location.replace('/');
            } else {
                page_error("保存失败");
            }
        }
    });
});

function save_state_info_callback(response) {
    if (response.code !== 0) {
        page_error("保存失败");
        return;
    }

    page_success("保存成功");
}