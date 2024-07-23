let 

var x = unpack(rows , 'x');
var y = unpack(rows , 'y');
var z = unpack(rows , 'z');
var c = unpack(rows , 'color');
Plotly.newPlot('myDiv', 
    [{
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
}],
    {
  height: 640,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: 'false',
  tickmode: "array",
  tickvals: [-1, 0, 1],
  ticktext: ['-1', '0', '1'],
});
});

console.log(window.getComputedStyle(document.getElementById("myDiv")));
