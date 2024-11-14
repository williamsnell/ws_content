import {get_epsilon, KDTree, normalize} from "./knn.js";
import {DEFAULT_2D_LAYOUT, DEFAULT_CONFIG, theme_text_color, colors, darker_marker_color, accent_color} from "./config.js";

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

export function get_mi_chart(id, signals, k=3) {
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
    let p_x_given_y_visible = false;
    let p_y_given_x_visible = false;
    let p_x_given_y = create_button("$$n_x$$", () => {
        p_x_given_y_visible = !p_x_given_y_visible;
        Plotly.restyle(elem.id, {visible: !p_x_given_y_visible}, [2, 3])
        Plotly.relayout(elem.id, {'shapes[0].opacity': !(p_x_given_y_visible | p_y_given_x_visible) ? 0.2 : 0, 
                                  'shapes[2].opacity': !p_x_given_y_visible ? 0.7 : 0});
    });
    let p_y_given_x = create_button("$$n_y$$", () => {
        p_y_given_x_visible = !p_y_given_x_visible;
        Plotly.restyle(elem.id, {visible: !p_y_given_x_visible}, [1, 3])
        Plotly.relayout(elem.id, {'shapes[0].opacity': !(p_y_given_x_visible | p_x_given_y_visible) ? 0.2 : 0, 
                                  'shapes[1].opacity': !p_y_given_x_visible ? 0.7 : 0});
    });

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

    if (m == 2) {
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
                    layout.xaxis.range = full_range.slice(0, 2);
                    layout.yaxis.range = full_range.slice(2, 4);
                    zoomed = !zoomed;
                } else {
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
            p_x_given_y_visible = false;
            p_y_given_x_visible = false;
        };
        
        // Make buttons for activating
        // marginal distributions,
        // hypercube view, etc.
    } else if (m == 3) {

    }
}
