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
            url: '/order_list',
            type: "get",
            data: {
                'api': true,
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
    $('#order_list_result > tbody  > tr').each(function () {
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
function add_row(order) {
    var tr = '<tr>';
    tr += '<td style="text-align:center;">' + order.id + '</td>';
    tr += '<td style="text-align:center;"><a href="/edit_room?room_id=' + order.room_id + '">' + order.room_name + '</a></td>';
    tr += '<td style="text-align:center;">' + order.plat_name + '</td>';
    tr += '<td style="text-align:center;">' + order.user_name + '</td>';
    tr += '<td style="text-align:center;">' + order.person_count + '</td>';
    tr += '<td style="text-align:center;">' + order.check_in + '</td>';
    tr += '<td style="text-align:center;">' + order.check_out + '</td>';
    tr += '<td style="text-align:center;">' + order.order_fee + '</td>';
    tr += '<td style="text-align:center;">' + order.phone + '</td>';
    tr += '<td style="text-align:center;">' + order.wechat + '</td>';
    tr += '<td style="text-align:center;">' + '<button type="button" class="btn btn-default btn-xs order-detail-button">查看</button>' + '</td>';
    tr += '</tr>';
    $("#order_list_result").append(tr);
}

$(document).on('click', '#search_room_name_btn', function () {
    query_and_update_view();
});