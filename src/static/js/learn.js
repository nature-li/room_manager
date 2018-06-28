x = [];
x.name = 1;
x.age = 23;


Object.keys(x).forEach(function(k){
    console.log(k + ' - ' + x[k]);
});