var start_date = null;
var end_date = null;

$(document).ready(function () {
    init_datetime_picker();
});

$(document).on('click', '.click_cell', function () {
    $(this).addClass("selected_cell");
    console.log($(this).find('span').html());
});

function init_datetime_picker() {
    var when = new Date();

    $('#electric_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#start_date").datepicker('setDate', when);

    $('#water_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#end_date").datepicker('setDate', when);
}