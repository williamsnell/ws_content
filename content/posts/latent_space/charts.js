const DEFAULT_CONFIG = {
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

const EMPTY_PLOT_OPTIONS = {mode: 'markers', layout: {}, config: {}, marker_settings: {}};

const DEFAULT_2D_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  autosize: false,
  hovermode: false,
  showlegend: false,
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

const DEFAULT_3D_LAYOUT = {
  autosize: false,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: false,
  showlegend: false,
  scene: {
    aspectmode: 'cube',
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


function remove_old_traces(chart, trace_id) {
  if (chart === null || chart.data === null) {throw("chart isn't defined properly.");}
  for (let i = 0; i < chart.data.length; i++) {
    if (chart.data[i].__tag__ == trace_id) {Plotly.deleteTraces(chart, i);}
  }
}

function add_line_2d(chart_id, x_points, y_points, 
  trace_settings={mode: 'lines'}) {
  let chart = document.getElementById(chart_id);

  let trace_id = self.crypto.randomUUID();

  function update_trace(p_x, p_y) {
    remove_old_traces(chart, trace_id);
    
    let data = {
      type: 'scattergl',
      x: p_x,
      y: p_y,
      __tag__: trace_id,
      ...trace_settings
    };

    Plotly.addTraces(chart, data);
  }

  update_trace(x_points, y_points);

  return update_trace;
}

function add_line_3d(chart_id, x_points, y_points, z_points, 
  trace_settings={mode: 'lines'}) {
  let chart = document.getElementById(chart_id);

  let trace_id = self.crypto.randomUUID();

  function update_trace(p_x, p_y, p_z) {
    remove_old_traces(chart, trace_id);

    let data = {
      type: 'scatter3d',
      x: p_x,
      y: p_y,
      z: p_z,
      __tag__: trace_id,
      ...trace_settings,
    };

    Plotly.addTraces(chart, data);
  }

  update_trace(x_points, y_points, z_points);

  return update_trace;
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
    __tag__: "scatter_points",
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
      __tag__: "scatter_points",
    }]

    // const points = {
    //   x: x,
    //   y: y,
    // };
    // Plotly.restyle(id, points, 0);
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
    __tag__: "scatter_points",
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
      __tag__: "scatter_points",
    }]
     
    Plotly.react(id, points, merged_layout, merged_config);
    // const update = {
    //   x: x,
    //   y: y,
    //   z: z,
    // };

    // Plotly.restyle(id, update, 0);
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
    let button_bar = plot_container.appendChild(document.createElement("div"));
    button_bar.style.display = "flex";
    button_bar.style.gap = "10px 10px";
    // add tab buttons
    let d2_button = button_bar.appendChild(document.createElement("button"));
    d2_button.textContent = "2D";
    d2_button.onclick = () => {
      d2_button.style.display = "none";
      d3_button.style.display = "block";
      fig_3d.style.display = "none"; 
      fig_2d.style.display = "block";
    };

    let d3_button = button_bar.appendChild(document.createElement("button"));
    d3_button.textContent = "3D";
    d3_button.onclick = () => {
      d3_button.style.display = "none";
      d2_button.style.display = "block";
      fig_3d.style.display = "block"; 
      fig_2d.style.display = "none";
    };
    // activate the default tab
    plot_container.appendChild(fig_2d);
    plot_container.appendChild(fig_3d);

    // Set defaults
    d2_button.style.display = "none";
    fig_3d.style.display = "none";

    options_2d.layout.width = width.toFixed(0);
    options_2d.layout.height = width.toFixed(0);
    options_3d.layout.width = width.toFixed(0);
    options_3d.layout.height = width.toFixed(0);
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

function get_projected_chart(vectors, id, axis_titles=[null, null, null], 
    projection=identity_transform,
    options_2d=EMPTY_PLOT_OPTIONS, options_3d=EMPTY_PLOT_OPTIONS) {
  let slice_offset = 0;
  let dimensions = 3;

  let [projected_3d, offset] = projection(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        slice_offset+2
                    );
  let [projected_2d, _] = projection(
                        vectors,
                        dimensions,
                        slice_offset,
                        slice_offset+1,
                        null
                    ); 

  let chart_draw = get_2d_3d_chart({d2: projected_2d, d3: projected_3d}, id, offset, axis_titles, options_2d, options_3d);

  async function draw(dimensions, slice_offset, project=projection) {
    let [projected_3d, offset] = project(
                          vectors,
                          dimensions,
                          slice_offset,
                          slice_offset+1,
                          slice_offset+2
                      );
    let [projected_2d, _] = project(
                          vectors,
                          dimensions,
                          slice_offset,
                          slice_offset+1,
                          null
                      ); 
    chart_draw(offset, projected_2d, projected_3d);
  }
  // return a callback that lets the user update dimensions and 
  // slice_offset
  
  return draw;
}

function get_interpolated_chart(vectors, id, interpolator, start_vec, stop_vec, 
  projection=identity_transform) {
  // make the markers less colorful, to accentuate the interpolation.
  //
  // Have to get this here or else the CSS hasn't fully loaded.
  let darker_plot = "rgb(150, 150, 150)";

  let options_2d = structuredClone(EMPTY_PLOT_OPTIONS);
  options_2d.marker_settings = structuredClone(DEFAULT_MARKERS);
  options_2d.marker_settings.color = darker_plot;
  options_2d.marker_settings.opacity = 0.7;

  let options_3d = structuredClone(EMPTY_PLOT_OPTIONS);
  options_3d.marker_settings = structuredClone(DEFAULT_3D_MARKERS);
  options_3d.marker_settings.color = darker_plot;
  options_3d.marker_settings.opacity = 0.7;


  let redraw_points = get_projected_chart(vectors, id, ["", "", ""], projection,
    options_2d, options_3d,); 
  
  let redraw_interp_2d = draw_2d_interp(
    `${id}_fig_2d`, start_vec, stop_vec, 1, interpolator, 0, 
    projection, {mode: 'lines', line: {color: accent_color, width: 3}});
  let redraw_interp_3d = draw_3d_interp(
    `${id}_fig_3d`, start_vec, stop_vec, 1, interpolator, 0, 
    projection, {mode: 'lines', line: {color: accent_color, width: 3}});

  function redraw(dimensions, slice_offset, projection) {
      redraw_points(dimensions, slice_offset, projection);
      redraw_interp_2d(dimensions, slice_offset);
      redraw_interp_3d(dimensions, slice_offset);
  } 
  // use the accent color for the interpolation lines
  //
  return redraw;
}

function generate_picture_frames(container, interpolators, pictures_folder, points, default_val) {
  let frame = container.appendChild(document.createElement("div"));
  frame.style.display = "flex";
  frame.style.justifyContent = "space-around";
  frame.style.height = "calc(min(30vh, 200px))";
  frame.style.margin = "20px 20px 20px 20px";
  frame.style.justifyContent = "space-around";

  for (const [name, _] of Object.entries(interpolators)) {
    let sub_frame = frame.appendChild(document.createElement("figure"));
    let title = sub_frame.appendChild(document.createElement("figcaption"));
    title.textContent = name;
    title.style.width = "calc(min(30%, 200px))";
    sub_frame.style.position = "relative";
    sub_frame.style.width = "calc(min(30%, 200px))";
    sub_frame.style.height = "calc(min(30vh, 200px) + 1rem)";
    for (const point of points)  {
      let img = sub_frame.appendChild(document.createElement("img"));
      img.style.position = "absolute";
      img.style.top = "2rem";
      img.style.right = "0";
      img.style.transitionDuration = "0.5s";
      img.style.transitionTimingFunction = "linear";
      img.src = `${pictures_folder}/${name}/${point}.jpg`;
      img.id = `${container}_${name}_${point}`;
      if (Number(point) != default_val) {
        img.style.opacity = "0";
      }
    }
  }
}

function get_multi_interp_chart(vectors, id, interpolators, start_vec, stop_vec, 
  pictures_folder, points, projection=identity_transform) {
  let container = document.getElementById(id);

  let plot_box = container.appendChild(document.createElement("div"));
  plot_box.id = id + "_plot_box";
  let darker_plot = "rgb(150, 150, 150)";

  let options_2d = structuredClone(EMPTY_PLOT_OPTIONS);
  options_2d.marker_settings = structuredClone(DEFAULT_MARKERS);
  options_2d.marker_settings.color = darker_plot;
  options_2d.marker_settings.opacity = 0.7;

  let options_3d = structuredClone(EMPTY_PLOT_OPTIONS);
  options_3d.marker_settings = structuredClone(DEFAULT_3D_MARKERS);
  options_3d.marker_settings.color = darker_plot;
  options_3d.marker_settings.opacity = 0.7;

  let redraw_points = get_projected_chart(vectors, plot_box.id, ["", "", ""], projection,
    options_2d, options_3d);

  // redraw the points at the max dimensionality
  redraw_points(vectors[0].length, 0);

  let point_list = container.appendChild(document.createElement("datalist"));
  point_list.id = id + "_datalist";

  let slider_div = document.createElement("div");
  let slider = slider_div.appendChild(document.createElement("input"));
  slider.id = id + "_slider";
  slider.style.display = "flex";
  slider.style.justifyContent = "center";
  slider.style.width = "auto";
  slider.style.margin = "auto";
  slider.style.marginTop = "10px";
  slider.style.marginTop = "10px";
  container.appendChild(slider_div);
  slider.type = "range";
  slider.min = "0";
  slider.max = "1";
  slider.value = "0";
  slider.step = `${1 / (points.length - 1)}`;
  slider.style.height = "15px";

  generate_picture_frames(container, interpolators, pictures_folder, points, 0); 
  slider.oninput = function(input){
    for (const [name, _] of Object.entries(interpolators)) {
      for (const point of points) {
        let img = document.getElementById(`${container}_${name}_${point}`);
        if (Number(this.value).toFixed(2) == point) {
          img.style.opacity = "1";
        } else {
          img.style.opacity = "0";
        }
      }
    }
  };

  // pre-fetch all the portraits
  // selectively hide/unhide the portraits 
  // as the slider scrolls through

  return (dimensions, slice_offset, proj=projection) => {
  }
      
  
  // buttons for navigating along the interpolation
    
  // get a slider for traversing the interpolations
  // get a picture widget
  //
}

function identity_transform(vec, dimensions, elem0, elem1, elem2) {
  if (dimensions < 3) {
    if (dimensions == 1) {
      return [vec.map((x) => [x[elem0], 0, 0]), 0];
    } else if (dimensions == 2) {
      return [vec.map((x) => [x[elem0], x[elem1], 0]), 0];
    }
  }
  else {
    return [vec, elem0];
  }
}

