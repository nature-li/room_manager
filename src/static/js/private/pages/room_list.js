$(document).ready(function () {
    // Global variables
    if (!window.save_data) {
        reset_save_data();
    }

    // Load data and then fresh page
    query_and_update_view();
});

// Init global variables
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
        'view_current_page_count': 0
    };
}

// Load data from server and then fresh page
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;
    var sort_column = $("#room_list_header").data("sort_column");
    var desc_order = $("#room_list_header").data("desc_order");

    $.ajax({
            url: '/room_list',
            type: "post",
            data: {
                'room_name': $("#search_room_name").val(),
                'sort_column': sort_column,
                'desc_order': desc_order,
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (response) {
                save_data_and_update_page_view(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 302) {
                    window.location.replace("/");
                } else {
                    page_error("Load data from server failed");
                }
            }
        }
    );
}

// Update page view
function update_page_view(page_idx) {
    // Refresh table header
    var sort_column = $("#room_list_header").data("sort_column");
    var desc_order = $("#room_list_header").data("desc_order");
    $("#room_list_header > th > span").each(function () {
        var th = $(this).closest('th');
        var column_name = $(th).data("column");

        $(this).removeClass("glyphicon-sort");
        $(this).removeClass("glyphicon-arrow-up");
        $(this).removeClass("glyphicon-arrow-down");
        if (column_name !== sort_column) {
            $(this).addClass("glyphicon-sort");
        } else {
            if (desc_order === 0) {
                $(this).addClass("glyphicon-arrow-up");
            } else {
                $(this).addClass("glyphicon-arrow-down");
            }
        }
    });

    // Drop table body
    $('#room_list_result > tbody  > tr').each(function () {
        $(this).remove();
    });

    // Add row to table
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var item = window.save_data.item_list[i];
        add_row(item);
    }

    // fresh page info
    update_page_partition(page_idx);
}

// Add one row to table
function add_row(room) {
    var tr = '<tr>';
    tr += '<td style="text-align:center;">' + room.id + '</td>';
    tr += '<td style="text-align:center;"><a href="/edit_room?room_id=' + room.id + '">' + room.room_name + '</a></td>';
    tr += '<td style="text-align:center;">' + room.room_pwd + '</td>';
    tr += '<td style="text-align:center;">' + room.rooter_name + '</td>';
    tr += '<td style="text-align:center;">' + room.rooter_pwd + '</td>';
    tr += '<td style="text-align:center;">' + room.wifi_name + '</td>';
    tr += '<td style="text-align:center;">' + room.wifi_pwd + '</td>';
    tr += '<td style="text-align:center;">' + room.create_time + '</td>';
    tr += '</tr>';
    $("#room_list_result").append(tr);
}

// Click Add-Room button
$(document).on('click', '#add_room_button', function () {
    window.location.replace('/add_room');
});

// Click Search button
$(document).on('click', '#search_room_name_btn', function () {
    query_and_update_view();
});

// Click Edit button
$(document).on('click', '.edit-room-button', function () {
    var room_id = $(this).closest('tr').find('td:eq(0)').text();
    var url = '/edit_room?room_id=' + room_id;
    window.location.replace(url);
});

// Click sort order
$(document).on('click', "#room_list_header > th.pointer", function () {
    var span = $(this).find('span').eq(0);
    var th = $(this).closest("th");
    var tr = $(this).closest("tr");

    var sort_column = $(th).data("column").trim();
    var desc_order = 0;
    if ($(span).hasClass("glyphicon-sort")) {
        $(span).removeClass("glyphicon-sort");
        $(span).addClass("glyphicon-arrow-up");
        desc_order = 0;
    } else if ($(span).hasClass("glyphicon-arrow-up")) {
        $(span).removeClass("glyphicon-arrow-up");
        $(span).addClass("glyphicon-arrow-down");
        desc_order = 1;
    } else if ($(span).hasClass("glyphicon-arrow-down")) {
        $(span).removeClass("glyphicon-arrow-down");
        $(span).addClass("glyphicon-arrow-up");
        desc_order = 0;
    } else {
        return;
    }

    // Set order condition
    $(tr).data("sort_column", sort_column);
    $(tr).data("desc_order", desc_order);

    // Reset all data
    reset_save_data();

    // Refresh page
    query_and_update_view();
});