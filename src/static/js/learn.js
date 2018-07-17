var province_map = [];
$("#lyg_province > tr").each(function (i, tr) {
    var province_id = $(tr).find('td').eq(0).text().trim();
    var province_name = $(tr).find('td').eq(1).text().trim();
    province_map[province_id] = province_name;
});
var need_data = [];
$("#lyg_city > tr").each(function (i, tr) {
   var city_id = $(tr).find('td').eq(0).text().trim();
   var city_name = $(tr).find('td').eq(1).text().trim();
   var city_category = $(tr).find('td').eq(2).text().trim();
   var parent_id = $(tr).find('td').eq(3).text().trim();

   if (city_category !== '3') {
       return;
   }

   if (province_map[parent_id] === undefined) {
       return;
   }

   if (parent_id === "10260") {
    need_data[city_id] = city_name;
   }
});

var total = '';
for (var k in need_data) {
    // put("10489", "开封");
    var s = '"' + k + '": "' + need_data[k] + '",';
    total += s;
}
console.log(total);


