let DEFAULT_CONFIG = {
  displayModeBar: false,
  dragMode: false,
  scrollZoom: true,
};

const accent_color = window.getComputedStyle(document.querySelector(".post-title")).color.toString();
const theme_text_color = window.getComputedStyle(document.querySelector(".post-content")).color.toString();

const DEFAULT_AXIS_FONT = {
  family: "Arial, Helvetica, sans-serif",
  size: 12,
  color: theme_text_color,
};

let DEFAULT_2D_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  autosize: false,
  hovermode: false,
  margin: {
    l: 40,
    r: 40,
    b: 40,
    t: 80,
    pad: 0,
  },
  scene: {
    aspectratio: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  xaxis: {
    scaleanchor: 'y',
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
  },
  yaxis: {
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
  },
};

const DEFAULT_MARKERS = {
  size: 2.0,
  color: accent_color,
  line: {
    width: 0,
  }
}

const DEFAULT_3D_MARKERS = {
  size: 0.5,
  color: accent_color,
  line: {
    width: 0,
  }
}

let DEFAULT_3D_LAYOUT = {
  autosize: false,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: false,
  scene: {
    aspectmode: 'data',
    xaxis: {
      zeroline: false,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
    },
    yaxis: {
      zeroline: false,
      scaleanchor: "x",
      scaleratio: 1,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
    },
    zaxis: {
      zeroline: false,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
    },
  },
};

function slice_arrays(index, array) {
  let x = [];
  let y = []; 
  let z = []; 

  if (array[0].length == 1) {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(0.);
      z.push(0.);
    }
  }
  else if (array[0].length == 2) {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(array[i][index + 1]);
      z.push(0.);
    }
  }
  else {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(array[i][index + 1]);
      z.push(array[i][index + 2]);
    }
  }

  return [x, y, z];
}

function vec_subscript(integer) {
  return `v\u20d7<sub>${integer}</sub>`;
}


function get_2d_chart(vectors, id, slice_offset=0, axis_titles=[null, null], options={mode: 'markers', 
  layout: {}, config: {}, marker_settings: {}}) {

  const elem = document.getElementById(id);
  if (elem === null) throw(`element given by ${id} doesn't exist`);

  let auto_sizing = {
    width: Math.min(elem.offsetWidth, 600).toFixed(0),
  }

  let merged_layout = {...auto_sizing, ...DEFAULT_2D_LAYOUT, ...options.layout};
  merged_layout.xaxis.title = {text: (axis_titles[0] === null) ? vec_subscript(slice_offset + 1) : axis_titles[0], font: DEFAULT_AXIS_FONT};
  merged_layout.yaxis.title = {text: (axis_titles[1] === null) ? vec_subscript(slice_offset + 2) : axis_titles[1], font: DEFAULT_AXIS_FONT};
  
  const merged_config = {...DEFAULT_CONFIG, ...options.config};
  const markers = {...DEFAULT_MARKERS, ...options.marker_settings};
  
  const [x, y, z] = slice_arrays(slice_offset, vectors);
  
  // adjust ticks
  merged_layout.xaxis.tickvals = [Math.round(Math.min(...x)), 0, Math.round(Math.max(...x))];
  merged_layout.yaxis.tickvals = [Math.round(Math.min(...y)), 0, Math.round(Math.max(...y))];

  
  const points = [{
    type: 'scattergl',
    mode: options.mode,
    x: x,
    y: y,
    marker: markers,
  }];

  Plotly.newPlot(elem, points, merged_layout, merged_config);

  /**
    * @param {number} slice_offset is the start of a 
    *                 new 2-long slice of the vector.
    *
    *                 E.g. if vectors was [1,2,3,4/* ],  */
  function update_vector_slice(slice_offset, vecs=vectors) {
    const [x, y, z] = slice_arrays(slice_offset, vecs);

    // adjust ticks
    merged_layout.xaxis.tickvals = [Math.round(Math.min(...x)), 0, Math.round(Math.max(...x))];
    merged_layout.yaxis.tickvals = [Math.round(Math.min(...y)), 0, Math.round(Math.max(...y))];

    const points = [{
      type: 'scattergl',
      mode: options.mode,
      x: x,
      y: y,
      marker: markers,
    }]
     
    Plotly.react(document.getElementById(id), points, merged_layout, merged_config);
  }

  return update_vector_slice;
}

function get_3d_chart(vectors, id, slice_offset=0, 
  axis_titles=[null, null, null],
  options={mode: 'markers', xaxis_title: null, yaxis_title: null, zaxis_title: null,
  layout: {}, config: {}, marker_settings: {}}) {

  const elem = document.getElementById(id);
  if (elem === null) throw(`element given by ${id} doesn't exist`);

  let auto_sizing = {
    width: Math.min(elem.offsetWidth, 600).toFixed(0),
    height: Math.min(elem.offsetWidth, 600).toFixed(0),
    margin: {t: 0, l: 0, r: 0, b: 0},
  }
  let merged_layout = {...auto_sizing, ...DEFAULT_3D_LAYOUT, ...options.layout};
  merged_layout.scene.xaxis.title = (axis_titles[0] === null) ? vec_subscript(slice_offset + 1) : axis_titles[0];
  merged_layout.scene.yaxis.title = (axis_titles[1] === null) ? vec_subscript(slice_offset + 2) : axis_titles[1];
  merged_layout.scene.zaxis.title = (axis_titles[2] === null) ? vec_subscript(slice_offset + 3) : axis_titles[2];

  const merged_config = {...DEFAULT_CONFIG, ...options.config};
  const markers = {...DEFAULT_3D_MARKERS, ...options.marker_settings};
  
  const [x, y, z] = slice_arrays(slice_offset, vectors);

  // adjust ticks
  merged_layout.scene.xaxis.tickvals = [Math.round(Math.min(...x)), 0, Math.round(Math.max(...x))];
  merged_layout.scene.yaxis.tickvals = [Math.round(Math.min(...y)), 0, Math.round(Math.max(...y))];
  merged_layout.scene.zaxis.tickvals = [Math.round(Math.min(...z)), 0, Math.round(Math.max(...z))];


    
  const points = [{
    type: 'scatter3d',
    mode: options.mode,
    x: x,
    y: y,
    z: z,
    marker: markers,
  }];

  Plotly.newPlot(elem, points, merged_layout, merged_config);

  /**
    * @param {number} slice_offset is the start of a 
    *                 new 2-long slice of the vector.
    *
    *                 E.g. if vectors was [1,2,3,4/* ],  */
  function update_vector_slice(slice_offset, vecs=vectors) {
    const [x, y, z] = slice_arrays(slice_offset, vecs);

    // adjust ticks
    merged_layout.scene.xaxis.tickvals = [Math.round(Math.min(...x)), 0, Math.round(Math.max(...x))];
    merged_layout.scene.yaxis.tickvals = [Math.round(Math.min(...y)), 0, Math.round(Math.max(...y))];
    merged_layout.scene.zaxis.tickvals = [Math.round(Math.min(...z)), 0, Math.round(Math.max(...z))];

    const points = [{
      type: 'scatter3d',
      mode: options.mode,
      x: x,
      y: y,
      z: z,
      marker: markers,
    }]
     
    Plotly.react(document.getElementById(id), points, merged_layout, merged_config);
  }

  return update_vector_slice;
}


const MAX_SIDEBYSIDE_WIDTH = 600;
/** Get a combined chart with a 2d view and a 3d view. 
  *  Based  on available space, this should either be
  *  two plots side-by-side, or else a tabbed view.
  *
  *  Eiher way, the combined plots show the same 
  *  vector space and sit in the same HTML element.
  */
function get_2d_3d_chart(vectors, id, slice_offset=0, axis_titles=[null, null, null], 
  options_2d={mode: 'markers', layout: {}, config: {}, marker_settings: {}},
  options_3d={mode: 'markers', layout: {}, config: {}, marker_settings: {}}) 
{
  const plot_container = document.getElementById(id);

  if (plot_container === null) throw("element not defined");
  const width = plot_container.offsetWidth;

  let fig_2d = document.createElement("div");
  fig_2d.id = id + "_fig_2d";
  let fig_3d = document.createElement("div");
  fig_3d.id = id + "_fig_3d";

  if (width < MAX_SIDEBYSIDE_WIDTH) {
    // add tab buttons
    // activate the default tab
    plot_container.appendChild(fig_2d);
    plot_container.appendChild(fig_3d);
    fig_3d.style.display = "none";
    // tabs
  } else {
    plot_container.style.display = "flex";
    fig_2d.style.borderRight = `1px solid ${theme_text_color}`;
    plot_container.appendChild(fig_2d);
    plot_container.appendChild(fig_3d);

    options_2d.layout.width = (width * 0.5).toFixed(0);
    options_2d.layout.height = (width * 0.5).toFixed(0);
    options_3d.layout.width = (width * 0.5).toFixed(0);
  }

  // Handling for passing different data to the different
  // plots. In this case, the input can be vec = Array[Array],
  // or else {d2: Array[Array], d3: Array[Array]} 
  let vecs_2d, vecs_3d;

  if (vectors.hasOwnProperty('d3')) {
    vecs_2d = vectors.d2;
    vecs_3d = vectors.d3;
  } else {
    vecs_2d = vectors;
    vecs_3d = vectors;
  }

  let update_2d = get_2d_chart(vecs_2d, fig_2d.id, slice_offset, [axis_titles[0], axis_titles[1]], options_2d);
  let update_3d = get_3d_chart(vecs_3d, fig_3d.id, slice_offset, axis_titles, options_3d);

  function update_both(slice_offset, vecs_2d=vectors, vecs_3d=vectors) {
    update_2d(slice_offset, vecs_2d);
    update_3d(slice_offset, vecs_3d);
  }
  return update_both;

}

function get_spherical_chart(vectors, id, axis_titles=[null, null, null]) {
  let slice_offset = 0;
  let dimensions = 3;
  let spherical = vecs_to_spherical(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        slice_offset+2
                    );
  let circular = vecs_to_spherical(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        null
                    ); 

  let chart_draw = get_2d_3d_chart({d2: circular, d3: spherical}, id, 0, axis_titles);

  async function draw(dimensions, slice_offset) {
    let spherical = vecs_to_spherical(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        slice_offset+2
                    );
    let circular = vecs_to_spherical(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        null
                    ); 
    chart_draw(0, circular, spherical);
  }
 // take in vecs, and do a spherical transformation of them
  // whenever "dimensions" changes
  //
  // return a callback that lets the user update dimensions and 
  // slice_offset
  
  return draw;
}
