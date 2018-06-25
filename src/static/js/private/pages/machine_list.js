$(document).ready(function () {
    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 查询全部用户并更新列表
    query_and_update_view();
});

// 初始化全局变量
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
        'current_machine_id': null,
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/api_query_machine',
            type: "post",
            data: {
                'machine': $("#search_machine").val(),
                'off_set': off_set,
                'limit': limit
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
    $('#machine_list_result > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var machine = window.save_data.item_list[i];
        add_row(machine.id, machine.ssh_user, machine.ssh_ip, machine.ssh_port, machine.create_time);
    }

    // 更新分页标签
    update_page_partition(page_idx);
}

// Click edit button
$(document).on("click", ".machine-edit-button", function () {
    var $tr = $(this).parent().parent();
    var machine_id = $tr.find("td:eq(0)").text();
    var ssh_user = $tr.find("td:eq(1)").text();
    var ssh_ip = $tr.find("td:eq(2)").text();
    var ssh_port = $tr.find("td:eq(3)").text();
    show_edit_dialog(machine_id, ssh_user, ssh_ip, ssh_port);
});

// Click delete button
$(document).on("click", ".machine-delete-button", function () {
    var $tr = $(this).closest('tr');
    window.current_machine_id = $tr.find("td:eq(0)").text();
    $.showConfirm("确定要删除吗?", delete_one_machine);
});


// Delete one machine
function delete_one_machine() {
    if (window.current_machine_id === null || window.current_machine_id === '') {
        return;
    }

    $.ajax({
            url: '/api_del_one_machine',
            type: "post",
            data: {
                'machine_id': window.current_machine_id
            },
            dataType: 'json',
            success: function (response) {
                window.current_machine_id = null;
                if (response.success === true) {
                    window.location.reload();
                    return;
                }

                if (response.code === 1) {
                    $.showErr("不能删除被引用项");
                    return;
                }

                $.showErr("删除失败");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                window.current_machine_id = null;
                if (jqXHR.status == 302) {
                    window.location.replace("/");
                } else {
                    $.showErr("发生错误");
                }
            }
        }
    );
}

// Popup edit dialog
function show_edit_dialog(machine_id, ssh_user, ssh_ip, ssh_port) {
    BootstrapDialog.show({
        message: function (dialog) {
            var content = '<div class="form-horizontal">';
            content += '<div class="form-group hidden">' +
                '<label class="col-xs-2">machine_id:</label>' +
                '<div class="col-xs-8">' +
                '<input id="machine_id" type="text" class="form-control" value="' + machine_id + '">' +
                '</div>' +
                '</div>';
            content += '<div class="form-group">' +
                '<label class="col-xs-2">SSH用户:</label>' +
                '<div class="col-xs-8">' +
                '<input id="ssh_user" type="text" class="form-control" value="' + ssh_user + '" readonly>' +
                '</div>' +
                '</div>';
            content += '<div class="form-group">' +
                '<label class="col-xs-2">SSH地址:</label>' +
                '<div class="col-xs-8">' +
                '<input id="ssh_ip" type="text" class="form-control" value="' + ssh_ip + '" readonly>' +
                '</div>' +
                '</div>';
            content += '<div class="form-group">' +
                '<label class="col-xs-2">SSH端口:</label>' +
                '<div class="col-xs-8">' +
                '<input id="ssh_port" type="text" class="form-control" value="' + ssh_port + '">' +
                '</div>' +
                '</div>';
            content += '</div>';

            return content;
        },
        title: "编辑机器",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // Get data after editing
                var new_machine_id = $("#machine_id").val().trim();
                var new_ssh_user = $("#ssh_user").val().trim();
                var new_ssh_ip = $("#ssh_ip").val().trim();
                var new_ssh_port = $("#ssh_port").val().trim();


                if (new_machine_id === "" || new_ssh_user === "" || new_ssh_ip === "" || new_ssh_port === "") {
                    return;
                }

                if (machine_id === new_machine_id &&
                    ssh_user === new_ssh_user &&
                    ssh_ip === new_ssh_ip &&
                    ssh_port === new_ssh_port) {
                    return;
                }

                // Set request to server
                // 发送请求
                $.ajax({
                        url: '/api_edit_machine',
                        type: "post",
                        data: {
                            'machine_id': new_machine_id,
                            'ssh_user': new_ssh_user,
                            'ssh_ip': new_ssh_ip,
                            'ssh_port': new_ssh_port,
                        },
                        dataType: 'json',
                        success: function (response) {
                            edit_machine_page_view(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 302) {
                                window.location.replace("/");
                            } else {
                                $.showErr("更新失败");
                            }
                        }
                    }
                );

                dialogItself.close();
            }
        },
            {
                label: '取消',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
    });
}

// Edit the row when get response from server
function edit_machine_page_view(response) {
    if (!response.success) {
        $.showErr("更新失败");
        return;
    }

    if (response.content.length === 0) {
        window.location.reload();
        return;
    }

    var machine = response.content[0];
    var machine_id = machine.id;
    var ssh_user = machine.ssh_user;
    var ssh_ip = machine.ssh_ip;
    var ssh_port = machine.ssh_port;
    var create_time = machine.create_time;

    $('#machine_list_result > tbody  > tr').each(function () {
        var bind_machine_id = $(this).find("td:eq(0)").text();

        if (bind_machine_id === machine_id.toString()) {
            $(this).find("td:eq(0)").html(machine_id);
            $(this).find("td:eq(1)").html(ssh_user);
            $(this).find("td:eq(2)").html(ssh_ip);
            $(this).find("td:eq(3)").html(ssh_port);
            $(this).find("td:eq(4)").html(create_time);
        }
    });
}

// Add machine
$("#add_machine_button").click(function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div>';
            // ssh_user
            content += '<div class="form-group"><input id="add_ssh_user" type="text" class="form-control" placeholder="输入SSH用户"></div>';
            // ssh_ip
            content += '<div class="form-group"><input id="add_ssh_ip" type="text" class="form-control" placeholder="输入SSH地址"></div>';
            // ssh_port
            content += '<div class="form-group"><input id="add_ssh_port" type="text" value="22" class="form-control" placeholder="输入SSH端口"></div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加机器",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // Get input data
                var ssh_user = $("#add_ssh_user").val().trim();
                var ssh_ip = $("#add_ssh_ip").val().trim();
                var ssh_port = $("#add_ssh_port").val().trim();

                if (ssh_user === '' || ssh_ip === '' || ssh_port === '') {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/api_add_machine',
                        type: "post",
                        data: {
                            'ssh_user': ssh_user,
                            'ssh_ip': ssh_ip,
                            'ssh_port': ssh_port,
                        },
                        dataType: 'json',
                        success: function (response) {
                            refresh_view(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 302) {
                                window.location.replace("/");
                            } else {
                                $.showErr("添加失败");
                            }
                        }
                    }
                );

                // 关闭窗口
                dialogItself.close();
            }
        },
            {
                label: '取消',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
    });
});

// 根据ajax返回值更新页面
function refresh_view(data) {
    if (data.success === true) {
        window.location.reload();
    } else {
        $.showErr("发生错误");
    }
}

// Add machine to table
function add_row(machine_id, ssh_user, ssh_ip, ssh_port, create_time) {
    var table = $("#machine_list_result");
    var tr = $(
        '<tr>' +
        '<td style="text-align:center;">' + machine_id + '</td>' +
        '<td style="text-align:center;">' + ssh_user + '</td>' +
        '<td style="text-align:center;">' + ssh_ip + '</td>' +
        '<td style="text-align:center;">' + ssh_port + '</td>' +
        '<td style="text-align:center;">' + create_time + '</td>' +
        '<td style="text-align:center;">' +
        '<button type="button" class="btn btn-default btn-xs machine-edit-button">编辑</button>' +
        '</td>' +
        '<td style="text-align:center;">' +
        '<button type="button" class="btn btn-default btn-xs machine-delete-button">删除</button>' +
        '</td>' +
        '</tr>');
    table.append(tr);
}

// 点击查找机器按钮
$(document).on("click", "#search_machine_btn", function (e) {
    // 清空数据并设置查找账号
    reset_save_data();

    // 查询数据并更新页面
    query_and_update_view();
});

// 点击查看公钥按钮
$(document).on('click', "#show_public_key_button", function (e) {
   window.open('/show_public_key', '_blank')
});