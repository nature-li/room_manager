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

    $.ajax({
            url: '/room_list',
            type: "post",
            data: {
                'room_name': $("#search_room_name").val(),
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