d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/_3d-line-plot.csv', function(err, rows){
      function unpack(rows, key) {
          return rows.map(function(row)
          { return row[key]; });
      }
var trace1 = {
  x: unpack(rows, 'x1'),
  y: unpack(rows, 'y1'),
  z: unpack(rows, 'z1'),
  mode: 'lines',
  marker: {
    color: '#1f77b4',
    size: 12,
    symbol: 'circle',
    line: {
      color: 'rgb(0,0,0)',
      width: 0
    }},
  line: {
    color: '#1f77b4',
    width: 1
  },
  type: 'scatter3d'
};
var trace2 = {
  x: unpack(rows, 'x2'),
  y: unpack(rows, 'y2'),
  z: unpack(rows, 'z2'),
  mode: 'lines',
  marker: {
    color: '#9467bd',
    size: 12,
    symbol: 'circle',
    line: {
      color: 'rgb(0,0,0)',
      width: 0
    }},
  line: {
    color: 'rgb(44, 160, 44)',
    width: 1
  },
  type: 'scatter3d'
};
var trace3 = {
  x: unpack(rows, 'x3'),
  y: unpack(rows, 'y3'),
  z: unpack(rows, 'z3'),
  mode: 'lines',
  marker: {
    color: '#bcbd22',
    size: 12,
    symbol: 'circle',
    line: {
      color: 'rgb(0,0,0)',
      width: 0
    }},
  line: {
    color: '#bcbd22',
    width: 1
  },
  type: 'scatter3d'
};
var data = [trace1, trace2, trace3];
var layout = {
  title: '3D Line Plot',
  autosize: false,
  width: 500,
  height: 500,
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 65
  }
};
Plotly.newPlot('myDiv', data, layout);
});
