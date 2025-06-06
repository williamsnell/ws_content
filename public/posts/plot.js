d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/3d-line1.csv', function(err, rows){
      function unpack(rows, key) {
          return rows.map(function(row)
          { return row[key]; }); }

var x = unpack(rows , 'x');
var y = unpack(rows , 'y');
var z = unpack(rows , 'z');
var c = unpack(rows , 'color');
Plotly.newPlot('myDiv', [{
  type: 'scatter3d',
  mode: 'lines',
  x: x,
  y: y,
  z: z,
  opacity: 1,
  line: {
    width: 6,
    color: c,
    reversescale: false
  }
}], {
  height: 640
});
});
