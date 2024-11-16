import {get_epsilon, KDTree, normalize} from "./knn.js";
import {DEFAULT_2D_LAYOUT, DEFAULT_3D_LAYOUT, DEFAULT_CONFIG, theme_text_color, colors, darker_marker_color, accent_color} from "./config.js";

function get_rect(xmin, xmax, ymin, ymax, style={}) {
    return {
        type: 'rect',
        x0: xmin,
        x1: xmax,
        y0: ymin,
        y1: ymax,
        ...style
    }
}

function get_cube(xmin, xmax, ymin, ymax, zmin, zmax, style={}) {
    return {
        x: [xmin, xmin,  xmax, xmax, xmin, xmin, xmax, xmax],
        y: [ymin, ymax, ymax, ymin, ymin, ymax, ymax, ymin],
        z: [zmin, zmin, zmin, zmin, zmax, zmax, zmax, zmax],
        i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
        j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
        k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
        ...style
    }
}

export function get_2d_mi_chart(id, signals, k=3) {
    //////////////// UI ///////////////////
    let box = document.getElementById(id);

    let elem = box.appendChild(document.createElement("div"));
    elem.id = `${id}-chart`;
    let button_bar = box.appendChild(document.createElement("div"));
    button_bar.id = `${id}-button-bar`;
    button_bar.classList.add("button_bar");

    function create_button(text, func= () => {}) {
        let out = button_bar.appendChild(document.createElement("button"));
        out.textContent = text;
        out.classList.add("mi_buttons");
        out.onclick = func;
        return out;
    }
    
    let select_hypercube = create_button("⛶");


    let showing_nx = false;
    let showing_ny = false;

    let nx = create_button("$$n_x$$"); 
    let ny = create_button("$$n_y$$");

    function click_nx() {
        if (!showing_nx) {
            nx.style = `outline: 5px ${theme_text_color} solid;`;
            ny.style = "";
            showing_nx = true;
            showing_ny = false;

            Plotly.restyle(elem.id, {visible: false}, [0, 2, 3])
            Plotly.restyle(elem.id, {visible: true}, [1])
            Plotly.relayout(elem.id, {
                'shapes[0].opacity': 0,
                'shapes[1].opacity': 0.7,
                'shapes[2].opacity': 0});
        } else {
            showing_nx = false;
            showing_ny = false;
            nx.style = "";
            ny.style = "";
            
            Plotly.restyle(elem.id, {visible: true}, [0, 1, 2, 3]);
            Plotly.relayout(elem.id, {'shapes[0].opacity': 0.2, 'shapes[1].opacity': 0.7, 'shapes[2].opacity': 0.7});
        }
    }

    function click_ny() {
        if (!showing_ny) {
            showing_ny = true;
            showing_nx = false;
            ny.style = `outline: 5px ${theme_text_color} solid;`;
            nx.style = "";

            Plotly.restyle(elem.id, {visible: false}, [0, 1, 3])
            Plotly.restyle(elem.id, {visible: true}, [2])
            Plotly.relayout(elem.id, {
                'shapes[0].opacity': 0,
                'shapes[1].opacity': 0,
                'shapes[2].opacity': 0.7});
        } else {
            showing_nx = false;
            showing_ny = false;
            ny.style = "";
            nx.style = "";

            Plotly.restyle(elem.id, {visible: true}, [0, 1, 2, 3]);
            Plotly.relayout(elem.id, {'shapes[0].opacity': 0.2, 'shapes[1].opacity': 0.7, 'shapes[2].opacity': 0.7});
        }    
    }

    nx.onclick = click_nx;
    ny.onclick = click_ny;

    let next_point = create_button("Next Point");

    ////////////// Maths ////////////////////
    let joint_samples = normalize(signals);

    let maxs = joint_samples[0].map((_, i) => Math.max(...joint_samples.map((x) => x[i]))); // min, max for each signal
    let mins = joint_samples[0].map((_, i) => Math.min(...joint_samples.map((x) => x[i]))); // min, max for each signal
    
    // Normalize the signals so the querying matches
    // what MI does.

    let m = signals[0].length;
    let n_samples = signals.length;

    // Build some KDTrees for fast querying if 
    // we change the target point.
    let joint_tree = new KDTree(joint_samples);

    let points_trace = {
        x: joint_samples.map((x) => x[0]),
        y: joint_samples.map((x) => x[1]),
        mode: 'markers',
        marker: {
            size: 2,
            color: darker_marker_color,
            opacity: 0.7,
        },
        type: 'scattergl',
    };


    //////////////// Point-based calculations /////////////////
    // These will need to change if the target point is ever
    // updated.
    function knn_calcs(point) {
        let cx = point[0];
        let cy = point[1];
        let [neighbors, dists] = joint_tree.knn(point, k + 1, true);
        neighbors = neighbors.slice(0, k);

        let l = dists[0] - get_epsilon(dists[0]);
        let xmin = cx - l;
        let xmax = cx + l;
        let ymin = cy - l;
        let ymax = cy + l;

        let bounded_x_points = joint_tree.find_bounded([[xmin, xmax], [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]]);
        let bounded_y_points = joint_tree.find_bounded([[Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY], [ymin, ymax]]);

        let point_trace = {
            x: [point[0]],
            y: [point[1]],
            mode: 'markers',
            marker: {
                size: 5,
                color: accent_color,
            },
            type: 'scattergl'
        };
        
        let xy_neighbors = {
            x: neighbors.map((x) => x[0]),
            y: neighbors.map((x) => x[1]),
            mode: 'markers',
            marker: {
                size: 3,
                color: accent_color,
            },
            type: 'scattergl'
        };

        let x_marginal = {
            x: bounded_x_points.map((x) => x[0]),
            y: bounded_x_points.map((x) => x[1]),
            mode: 'markers',
            marker: {
                size: 2.5,
                color: colors[0],
            },
            type: 'scattergl',
        };

        let y_marginal = {
            x: bounded_y_points.map((x) => x[0]),
            y: bounded_y_points.map((x) => x[1]),
            mode: 'markers',
            marker: {
                size: 2.5,
                color: colors[1],
            },
            type: 'scattergl',
        };

        let hypercube = get_rect(xmin, xmax, ymin, ymax, 
            {
                opacity: 0.2,
                fillcolor: accent_color,
                line: {
                    width: 1
                },
            });

        let x_hyperrect = get_rect(cx - l, cx + l, 2 * mins[1], 2 * maxs[1],
            {
                fillcolor: "transparent",
                opacity: 1,
                line: {
                    color: theme_text_color,
                    width: 1
                }
            }
        );

        let y_hyperrect = get_rect(2 * mins[0], 2 * maxs[0], cy - l, cy + l,
            {
                fillcolor: "transparent",
                opacity: 1,
                line: {
                    color: theme_text_color,
                    width: 1
                }
            }
        );

        return [hypercube, x_hyperrect, y_hyperrect, point_trace, xy_neighbors, x_marginal, y_marginal, l];
    }

    let drawn = false;

    let layout = structuredClone(DEFAULT_2D_LAYOUT);
    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 600).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }
    layout = {...auto_sizing, ...layout}; 
    layout.yaxis.scaleanchor = "x";

    function draw_for_point(point) {
        let [hypercube, x_hyperrect, y_hyperrect, point_trace, xy_neighbors, x_marginal, y_marginal, side_length] = knn_calcs(point);

        let full_range = [mins[0], maxs[0], mins[1], maxs[1]];
        let constrained_range = [point[0] - side_length * 4, point[0] + side_length * 4, 
                                 point[1] - side_length * 4, point[1] + side_length * 4];

        layout.xaxis.range = [mins[0], maxs[0]];
        layout.yaxis.range = [mins[1], maxs[1]];

        let zoomed = false;
        select_hypercube.onclick = () => {
            if (zoomed) {
                select_hypercube.style = "";
                layout.xaxis.range = full_range.slice(0, 2);
                layout.yaxis.range = full_range.slice(2, 4);
                zoomed = !zoomed;
            } else {
                select_hypercube.style = `outline: ${theme_text_color} 5px solid;`;
                layout.xaxis.range = constrained_range.slice(0, 2);
                layout.yaxis.range = constrained_range.slice(2, 4);
                zoomed = !zoomed;
            }
            Plotly.relayout(elem.id, layout);
        };

        layout.shapes = [hypercube, x_hyperrect, y_hyperrect];

        if (drawn) {
            Plotly.react(elem.id, [points_trace, x_marginal, y_marginal, xy_neighbors, point_trace], layout, DEFAULT_CONFIG);
        } else {
            Plotly.newPlot(elem.id, [points_trace, x_marginal, y_marginal, xy_neighbors, point_trace], layout, DEFAULT_CONFIG);
            drawn = true;
        }
    }
    if (MathJax) {
        MathJax.typeset();
    };


    let point_id = 0;
    draw_for_point(joint_samples[0]);
    
    next_point.onclick = () => {
        point_id += 1;
        draw_for_point(joint_samples[point_id]);
        Plotly.restyle(elem.id, {visible: true}, [0, 1, 2, 3])
        showing_nx = false;
        showing_ny = false;
        nx.style = "";
        ny.style = "";
        select_hypercube.style = "";
    };
}


export function get_3d_mi_chart(id, signals, k=3) {
    //////////////// UI ///////////////////
    let box = document.getElementById(id);

    let elem = box.appendChild(document.createElement("div"));
    elem.id = `${id}-chart`;
    let button_bar = box.appendChild(document.createElement("div"));
    button_bar.id = `${id}-button-bar`;
    button_bar.classList.add("button_bar");

    function create_button(text, func= () => {}) {
        let out = button_bar.appendChild(document.createElement("button"));
        out.textContent = text;
        out.classList.add("mi_buttons");
        out.onclick = func;
        return out;
    }
    
    let select_hypercube = create_button("⛶");


    let showing_nx = false;
    let showing_ny = false;
    let showing_nz = false;

    let nx = create_button("$$n_{xy}$$"); 
    let ny = create_button("$$n_{yz}$$");
    let nz = create_button("$$n_y$$");

    function save_camera_position() {
        const scene = elem._fullLayout.scene._scene;
        const layout = scene.graphDiv.layout;

        function restore_layout() {
            scene.saveLayout(layout);
        }

        return restore_layout;
    }


    function click_nx() {
        let restore = save_camera_position();
        if (!showing_nx) {
            showing_nx = true;
            showing_ny = false;
            showing_nz = false;

            nx.style = `outline: 5px ${theme_text_color} solid;`;
            ny.style = "";
            nz.style = "";
            
            Plotly.restyle(elem.id, {visible: false}, [1, 2, 3, 4, 5, 6, 7, 8, 9])
            Plotly.restyle(elem.id, {visible: true}, [2, 6, 7])
        } else {
            showing_nx = false;
            showing_ny = false;
            showing_nz = false;

            nx.style = "";
            ny.style = "";
            nz.style = "";
            
            Plotly.restyle(elem.id, {visible: true});
            Plotly.restyle(elem.id, {visible: false}, [7, 8, 9]);
        }
        restore();
    }

    function click_ny() {
        let restore = save_camera_position();
        if (!showing_ny) {
            showing_nx = false;
            showing_ny = true;
            showing_nz = false;

            ny.style = `outline: 5px ${theme_text_color} solid;`;
            nx.style = "";
            nz.style = "";

            Plotly.restyle(elem.id, {visible: false}, [1, 2, 3, 4, 5, 6, 7, 8, 9])
            Plotly.restyle(elem.id, {visible: true}, [3, 6, 8])
        } else {
            showing_nx = false;
            showing_ny = false;
            showing_nz = false;

            nx.style = "";
            ny.style = "";
            nz.style = "";

            Plotly.restyle(elem.id, {visible: true});
            Plotly.restyle(elem.id, {visible: false}, [7, 8, 9]);
        }    
        restore();
    }

    function click_nz() {
        let restore = save_camera_position();
        if (!showing_nz) {
            showing_nx = false;
            showing_ny = false;
            showing_nz = true;

            nx.style = "";
            ny.style = "";
            nz.style = `outline: 5px ${theme_text_color} solid;`;

            Plotly.restyle(elem.id, {visible: false}, [1, 2, 3, 4, 5, 6, 7, 8, 9])
            Plotly.restyle(elem.id, {visible: true}, [1, 6, 9])
        } else {
            showing_nx = false;
            showing_ny = false;
            showing_nz = false;

            nx.style = "";
            ny.style = "";
            nz.style = "";

            Plotly.restyle(elem.id, {visible: true});
            Plotly.restyle(elem.id, {visible: false}, [7, 8, 9]);
        }    
        restore();
    }
    nx.onclick = click_nx;
    ny.onclick = click_ny;
    nz.onclick = click_nz;

    let next_point = create_button("Next Point");

    ////////////// Maths ////////////////////
    let joint_samples = normalize(signals);

    let maxs = joint_samples[0].map((_, i) => Math.max(...joint_samples.map((x) => x[i]))); // min, max for each signal
    let mins = joint_samples[0].map((_, i) => Math.min(...joint_samples.map((x) => x[i]))); // min, max for each signal
    
    // Normalize the signals so the querying matches
    // what MI does.

    let m = signals[0].length;
    let n_samples = signals.length;

    // Build some KDTrees for fast querying if 
    // we change the target point.
    let joint_tree = new KDTree(joint_samples);

    let points_trace = {
        x: joint_samples.map((x) => x[0]),
        y: joint_samples.map((x) => x[1]),
        z: joint_samples.map((x) => x[2]),
        mode: 'markers',
        marker: {
            size: 0.5,
            color: darker_marker_color,
            opacity: 0.7,
        },
        type: 'scatter3d',
    };


    //////////////// Point-based calculations /////////////////
    // These will need to change if the target point is ever
    // updated.
    function knn_calcs(point) {
        let cx = point[0];
        let cy = point[1];
        let cz = point[2];

        let [neighbors, dists] = joint_tree.knn(point, k + 1, true);
        neighbors = neighbors.slice(0, k);

        let l = dists[0] - get_epsilon(dists[0]);
        let xmin = cx - l;
        let xmax = cx + l;
        let ymin = cy - l;
        let ymax = cy + l;
        let zmin = cz - l;
        let zmax = cz + l;

        let bounded_x_points = joint_tree.find_bounded([[xmin, xmax], 
                                                        [ymin, ymax], 
                                                        [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]]);

        let bounded_y_points = joint_tree.find_bounded([[Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY], 
                                                        [ymin, ymax],
                                                        [zmin, zmax]]);

        let bounded_z_points = joint_tree.find_bounded([[Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY], 
                                                        [ymin, ymax],
                                                        [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]]);

        let point_trace = {
            x: [point[0]],
            y: [point[1]],
            z: [point[2]],
            mode: 'markers',
            marker: {
                size: 1,
                color: accent_color,
            },
            type: 'scatter3d'
        };
        
        let xyz_neighbors = {
            x: neighbors.map((x) => x[0]),
            y: neighbors.map((x) => x[1]),
            z: neighbors.map((x) => x[2]),
            mode: 'markers',
            marker: {
                size: 1,
                color: accent_color,
            },
            type: 'scatter3d'
        };

        let x_marginal = {
            x: bounded_x_points.map((x) => x[0]),
            y: bounded_x_points.map((x) => x[1]),
            z: bounded_x_points.map((x) => x[2]),
            mode: 'markers',
            marker: {
                size: 1,
                color: colors[0],
            },
            type: 'scatter3d',
        };

        let y_marginal = {
            x: bounded_y_points.map((x) => x[0]),
            y: bounded_y_points.map((x) => x[1]),
            z: bounded_y_points.map((x) => x[2]),
            mode: 'markers',
            marker: {
                size: 1,
                color: colors[1],
            },
            type: 'scatter3d',
        };

        let z_marginal = {
            x: bounded_z_points.map((x) => x[0]),
            y: bounded_z_points.map((x) => x[1]),
            z: bounded_z_points.map((x) => x[2]),
            mode: 'markers',
            marker: {
                size: 1,
                color: colors[3],
            },
            type: 'scatter3d',
        };

        let hypercube = get_cube(xmin, xmax, ymin, ymax, zmin, zmax,
            {
                opacity: 0.2,
                color: accent_color,
                flatshading: true,
                line: {
                    width: 1
                },
                type: "mesh3d",
            });

        let x_hyperrect = get_cube(xmin, xmax, ymin, ymax, mins[2], maxs[2], 
            {
                color: colors[0],
                opacity: 0.2,
                flatshading: true,
                type: "mesh3d",
            }
        );

        let y_hyperrect = get_cube(mins[0], maxs[0], ymin, ymax, zmin, zmax,
            {
                color: colors[1],
                opacity: 0.2,
                flatshading: true,
                type: "mesh3d",
            }
        );

        let z_hyperrect = get_cube(mins[0], maxs[0], ymin, ymax, mins[2], maxs[2], 
            {
                color: colors[3],
                opacity: 0.2,
                flatshading: true,
                type: "mesh3d",
            }
        );
        return [hypercube, x_hyperrect, y_hyperrect, z_hyperrect, point_trace, xyz_neighbors, x_marginal, y_marginal, z_marginal, l];
    }

    let drawn = false;

    let layout = structuredClone(DEFAULT_3D_LAYOUT);
    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 600).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }
    layout = {...auto_sizing, ...layout}; 

    function draw_for_point(point) {
        let [hypercube, x_hyperrect, y_hyperrect, z_hyperrect, 
            point_trace, xyz_neighbors, x_marginal, y_marginal, z_marginal, 
            side_length] = knn_calcs(point);

        let full_range = [mins[0], maxs[0], mins[1], maxs[1], mins[2], maxs[2]];
        let constrained_range = [point[0] - (maxs[0] - mins[0]), point[0] + (maxs[0] - mins[0]), 
                                 point[1] - (maxs[1] - mins[1]), point[1]  + (maxs[1] - mins[1]),
                                 point[2] - (maxs[2] - mins[2]), point[2] + (maxs[2] - mins[2])];

        layout.scene.xaxis.range = [mins[0], maxs[0]];
        layout.scene.yaxis.range = [mins[1], maxs[1]];
        layout.scene.zaxis.range = [mins[2], maxs[2]];
        layout.scene.aspectmode = "manual";
        layout.scene.aspectratio = {x: 1, y: 1, z: 1};
        layout.scene.camera = {
            center: {x: 0, y: 0, z: 0},
            eye: {x: 1, y: 1, z: 1},
            projection: {
                type: "orthographic", 
            }
        };


        let zoomed = false;

        select_hypercube.onclick = () => {
            if (zoomed) {
                select_hypercube.style = "";
                layout.scene.xaxis.range = full_range.slice(0, 2);
                layout.scene.yaxis.range = full_range.slice(2, 4);
                layout.scene.zaxis.range = full_range.slice(4, 6);
                layout.scene.camera.center = {x: 0, y: 0, z: 0};
                layout.scene.camera.eye = {x: 1, y: 1, z: 1};
                // in orthographic mode, the aspect ratio sets the zoom
                layout.scene.aspectratio = {x: 1, y: 1, z: 1};
                zoomed = !zoomed;
            } else {
                select_hypercube.style = `outline: ${theme_text_color} 5px solid;`;
                layout.scene.xaxis.range = constrained_range.slice(0, 2);
                layout.scene.yaxis.range = constrained_range.slice(2, 4);
                layout.scene.zaxis.range = constrained_range.slice(4, 6);
                layout.scene.camera.center = {x: 0, y: 0, z: 0};
                // In perspective mode, the camera eye sets the zoom level
                // layout.scene.camera.eye = {x: 0.1, y: 0.1, z: 0.1};
                layout.scene.aspectratio = {x: 0.01, y: 0.01, z: 0.01};
                zoomed = !zoomed;
            }
            Plotly.relayout(elem.id, layout);
        };

        if (drawn) {
            // We plot z_marginal before x_marginal and y_marginal because y is 
            // a subset of z and will otherwise be masked.
            Plotly.react(elem.id, [points_trace, z_marginal, x_marginal, y_marginal, 
                                   xyz_neighbors, point_trace, 
                                   hypercube, x_hyperrect, y_hyperrect, z_hyperrect], 
                        layout, DEFAULT_CONFIG);
        } else {
            Plotly.newPlot(elem.id, [points_trace, z_marginal, x_marginal, y_marginal, 
                                    xyz_neighbors, point_trace, 
                                    hypercube, x_hyperrect, y_hyperrect, z_hyperrect], 
                            layout, DEFAULT_CONFIG);
            drawn = true;
        }
        Plotly.restyle(elem.id, {visible: true}, [0, 1, 2, 3, 4, 5, 6])
        Plotly.restyle(elem.id, {visible: false}, [7, 8, 9])

    }
    if (MathJax) {
        MathJax.typeset();
    };


    let point_id = 0;
    draw_for_point(joint_samples[0]);
    
    next_point.onclick = () => {
        let restore = save_camera_position();
        point_id += 1;
        draw_for_point(joint_samples[point_id]);
        
        restore();
        showing_nx = false;
        showing_ny = false;
        showing_nz = false;
        nx.style = "";
        ny.style = "";
        nz.style = "";
        select_hypercube.style = "";
    };
}

export function get_3d_chart(id, signals) {
    let elem = document.getElementById(id); 

    let joint_samples = normalize(signals);

    let maxs = joint_samples[0].map((_, i) => Math.max(...joint_samples.map((x) => x[i]))); // min, max for each signal
    let mins = joint_samples[0].map((_, i) => Math.min(...joint_samples.map((x) => x[i]))); // min, max for each signal
 
    let points_trace = {
        x: joint_samples.map((x) => x[0]),
        y: joint_samples.map((x) => x[1]),
        z: joint_samples.map((x) => x[2]),
        mode: 'markers',
        marker: {
            size: 0.5,
            color: darker_marker_color,
            opacity: 0.7,
        },
        type: 'scatter3d',
    };

    let layout = structuredClone(DEFAULT_3D_LAYOUT);
    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 600).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }
    layout = {...auto_sizing, ...layout}; 
    layout.scene.xaxis.range = [mins[0], maxs[0]];
    layout.scene.yaxis.range = [mins[1], maxs[1]];
    layout.scene.zaxis.range = [mins[2], maxs[2]];
    layout.scene.aspectmode = 'cube';

    Plotly.newPlot(elem.id, [points_trace], layout, DEFAULT_CONFIG);
}
