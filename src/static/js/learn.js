var x = new Date();

var y = new Date();
y.setDate(y.getDate() + 1);

console.log(y.getTime());
console.log(x.getTime());
console.log(y.getTime() - x.getTime());
