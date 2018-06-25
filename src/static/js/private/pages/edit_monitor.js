// Init page
$(document).ready(function () {
    if (!window.save_data) {
        reset_save_data();
    }

    // Init operator list
    init_operator_list();
});

// Init global variable for this page
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
        'operator_list': [],
        'have_been_changed': false,
    };
}

// Go to monitor list
$(document).on('click', '#btn_go_monitor_list', function (e) {
    window.location.replace('/');
});

// Go to monitor view
$(document).on('click', '#btn_go_monitor_view', function (e) {
    var service_id = $('#service_id').val();
    var url = '/view_monitor?service_id=' + service_id;
    window.location.replace(url);
});


// Give up edit
$(document).on('click', '#btn_cancel_submit', function (e) {
    window.location.replace('/');
});


// Submit change
$(document).on('click', '#btn_submit', function () {
    var service_id = $('#service_id').val();
    if (!window.have_been_changed) {
        window.location.replace('/');
        return;
    }

    var request = get_page_detail();
    if (request === null) {
        go_to_top();
        return;
    }

    $.ajax({
            url: '/api_edit_monitor_detail',
            data: {
                service_id: service_id,
                monitor_detail: JSON.stringify(request),
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                if (!response.success) {
                    return;
                }

                window.location.replace('/');
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
});


$('.form_change').change(function () {
    // Set change status
    window.have_been_changed = true;
});

$(document).on('click', '#btn_delete_monitor_detail', function () {
    $.showConfirm("确定要删除吗?", delete_monitor_detail);
});

// send request to delete monitor_detail
function delete_monitor_detail() {
    var service_id = $('#service_id').val();
    $.ajax({
            url: '/api_delete_monitor_detail',
            type: "post",
            data: {
                'service_id': service_id
            },
            dataType: 'json',
            success: function (response) {
                handle_delete_response(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.location.replace("/");
                } else {
                    $.showErr("发生错误");
                }
            }
        }
    );
}

function handle_delete_response(response) {
    if (response.success === true) {
        window.location.replace('/');
        return;
    }

    if (response.code === 1) {
        $.showErr("不能删除被依赖项");
        return;
    }

    $.showErr("删除失败");
}
