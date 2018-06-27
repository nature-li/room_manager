var start_date = null;
var end_date = null;

$(document).on('click', '.click_cell', function () {
    $(this).addClass("selected_cell");
    console.log($(this).find('span').html());
});