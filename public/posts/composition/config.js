const DEFAULT_CONFIG = {
  displayModeBar: false,
  dragmode: false,
  scrollZoom: true,
  showAxisDragHandles: false,
};

const accent_color = "#FFA86A";
const theme_text_color = "#FFFFFF";
const colors = ["#23B0FF", "#FF6266", "#FFA86A", "#EE72F1", "#23B0FF"];

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
  dragmode: false,
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
    }
  },
  xaxis: {
    scaleanchor: 'y',
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
    range: [-1.5, 1.5],
  },
  yaxis: {
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
    range: [-1.5, 1.5],
  },
};

const d2_layout = {  
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  autosize: false,
  hovermode: false,
  showlegend: false,
  dragmode: false,
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
    }
  },
  xaxis: {
    scaleanchor: 'y',
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
    range: [-1.5, 1.5],
  },
  yaxis: {
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
    range: [-1.5, 1.5],
  },
}

const d1_layout = {  
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  autosize: false,
  hovermode: false,
  showlegend: false,
  dragmode: false,
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
      y: 0.25,
    }
  },
  xaxis: {
    scaleanchor: 'y',
    zeroline: false,
    tickmode: "array",
    tickvals: [-1, 0, 1], 
    range: [-1.5, 1.5],
  },
  yaxis: {
    zeroline: false,
    tickmode: "array",
    tickvals: [], 
  },
}

const DEFAULT_MARKERS = {
  size: 10.0,
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

const scene_rules = {
    aspectmode: 'cube',
    camera: {
        projection: {
            type: "orthographic", 
        }
    },
    xaxis: {
      zeroline: false,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
      range: [-1.5, 1.5],
    },
    yaxis: {
      zeroline: false,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
      range: [-1.5, 1.5],
    },
    zaxis: {
      zeroline: false,
      tickmode: "array",
      tickvals: [-1, 0, 1], 
      range: [-1.5, 1.5],
    },
  };

const d2_rules = structuredClone(scene_rules);

d2_rules.zaxis.range = [0];
d2_rules.zaxis.tickvals = [];

const DEFAULT_3D_LAYOUT = {
  autosize: false,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: false,
  showlegend: false,
  scene1: structuredClone(scene_rules),
  scene2: d2_rules,
  scene3: structuredClone(scene_rules),
  margin: {
      l: 10,
      r: 10,
      b: 10,
      t: 10
  },
};

const MAX_SIDEBYSIDE_WIDTH = 600;
