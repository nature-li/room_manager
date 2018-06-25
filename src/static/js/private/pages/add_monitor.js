// Init page
$(document).ready(function () {
    if (!window.save_data) {
        reset_save_data();
    }

    // Init machine list()
    init_machine_list();

    // Init select menu for rely services
    init_rely_service_select();

    // Init operator list
    init_operator_list();
});

// Init machine list
function init_machine_list() {
    $.ajax({
            url: '/api_query_machine',
            type: 'post',
            data: {
                'machine': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (response) {
                if (!response.success) {
                    return;
                }

                for (var i = 0; i < response.content.length; i++) {
                    var item = response.content[i];
                    var option = '<option value=' + item.id + '>' + item.ssh_user + '@' + item.ssh_ip + ':' + item.ssh_port + '</option>';
                    $('#service_manager_select').append(option);
                }
                $('#service_manager_select').selectpicker('refresh');

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

// Go home
$(document).on('click', '#btn_cancel_submit', function (e) {
    window.location.replace('/monitor_list');
});

// Submit form
$(document).on('click', '#btn_submit', function (e) {
    var request = get_page_detail();
    if (request === null) {
        go_to_top();
        return;
    }

    $.ajax({
            url: '/api_add_monitor_detail',
            data: {
                monitor_detail: JSON.stringify(request),
            },
            type: 'post',
            dataType: 'json',
            success: function(response) {
                if (!response.success) {
                    $.showErr(response.msg)
                    return;
                }

                window.location.replace('/');
            },
            error: function(jqXHR, textStatus, errorThrown){
                if (jqXHR.status === 302) {
                    window.location.replace('/');
                } else {
                    $.showErr('发生错误')
                }
            },
        }
    );
});