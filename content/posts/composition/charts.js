const FREQUENCY = 0.004; // rad/s

function plot(id, layout, callback=()=>{}) {
    let elem = document.getElementById(id);
    let initialized = false;
    let paused = false;
           /* Plot vectors of shape
           *
           */
    return function plot_vectors(tensors) {
        let traces = [];
        let trace_numbers = [];

        for (let j = 0; j < tensors.length; j++) {
           let tensor = tensors[j];
           let vectors = tensor.arraySync();

           for (let i = 0; i < vectors.length; i++) {
                trace_numbers.push(traces.length);

                let vector = vectors[i];

                let marker = structuredClone(DEFAULT_MARKERS);
                marker.color = colors[i % colors.length];

                if (vector.length >= 3) {
                    // 3D or greater
                    traces.push(
                    {
                       x: [vector[0]],
                       y: [vector[1]],
                       z: [vector[2]],
                       mode: 'markers',
                       marker: marker,
                       type: 'scatter3d',
                       scene: `scene${j+1}`,
                    })
                } else {
                    // 2D or 1D 
                    let y;
                    if (vector.length == 1) {
                        y = [0];
                    } else {
                        y = [vector[1]];
                    }
                    traces.push(
                    {
                        x: [vector[0]],
                        y: y,
                        mode: 'markers',
                        marker: marker,
                        type: 'scatter',
                        scene: `scene${j+1}`,
                    })
                }
            }
        }

        if (initialized) {
            if (!paused) {
                Plotly.react(id, traces, layout, DEFAULT_CONFIG);
                callback();
            }
        } else {
            Plotly.newPlot(elem, traces, layout, DEFAULT_CONFIG);
            initialized = true;

            elem.addEventListener('pointerdown', () => {paused = true;});
            elem.addEventListener('click', () => {paused = false;});
            //elem.addEventListener('pointerup', () => {setTimeout(() => {paused = false;}, 1000);});
        }
    }
}

function draw_line_2d(graph_div, line) {
    // get extents of graph
    // calculate corner points
    let x_points, y_points;
    if (line[0] != 0) {
        x_points = graph_div.layout.xaxis.range;
        let slope = line[1] / line[0];
        y_points = [x_points[0] * slope, x_points[1] * slope]; 
    }
    else if (line[1] != 0) {
        y_points = graph_div.layout.yaxis.range;
        x_points = [0, 0];
    }
    else {
        y_points = [0, 0];
        x_points = [0, 0];
    }
    Plotly.addTraces(graph_div, [{x: x_points, y: y_points}]);
}

function default_2d_points() {
    let start_time = Date.now();

    return function get_points() {
        let elapsed = Date.now() - start_time;

        let sine = Math.sin(elapsed * FREQUENCY);
        let cosine = Math.cos(elapsed * FREQUENCY);

        let vectors = tf.tensor([
            [0.5 * sine, -0.75],
            [0.75,   0.5 * cosine],
            [0.5 * sine * cosine, 0],
            [-0.5 * cosine - 0.5, sine]
            ]);

        return vectors;
    }
}

let w_down = [1, 0];
let w_up = [0.2, 0.9];
let w = tf.tensor([w_down]).mul(tf.tensor([w_up]).transpose());

function d2_d1(id) {
    let elem = document.getElementById(id)
    let chart2d = document.createElement("div");
    chart2d.id = `${id}-2D`;
    let chart1d = document.createElement("div");
    chart1d.id = `${id}-1D`;

    elem.appendChild(chart2d);
    elem.appendChild(chart1d);

    // we want a "orient to line" button
    let orient = document.createElement("button");
    orient.id = `${id}-orient-button`;
    orient.onclick = "";


    // set up the plots 
    let plotter = plot(chart2d.id, d2_layout, () => draw_line_2d(chart2d, w_down));
    let plotter2 = plot(chart1d.id, d1_layout);

    let get_points = default_2d_points();

    function animate_point() {
        let vectors = get_points();
        let hidden = tf.einsum("br, hr -> bh", vectors, tf.tensor([w_down]));

        plotter([vectors]);
        plotter2([hidden]);

        requestAnimationFrame(animate_point);
    }

    animate_point();
}

function d1_d2(id) {
    let elem = document.getElementById(id)
    let chart2d = document.createElement("div");
    chart2d.id = `${id}-2D`;
    let chart1d = document.createElement("div");
    chart1d.id = `${id}-1D`;

    elem.appendChild(chart1d);
    elem.appendChild(chart2d);

    // we want a "orient to line" button
    let orient = document.createElement("button");
    orient.id = `${id}-orient-button`;
    orient.textContent = `Orient to \\(\\; W_{1\\rightarrow2} \\)`;
    elem.appendChild(orient);
    orient.onclick = "";


    // set up the plots 
    let plotter = plot(chart1d.id, d1_layout);
    let plotter2 = plot(chart2d.id, d2_layout, () => draw_line_2d(chart2d, w_up));

    let get_points = default_2d_points();

    function animate_point() {
        let hidden = tf.einsum("br, hr -> bh", get_points(), tf.tensor([w_down]));
        let out = tf.einsum("bh, hr -> br", hidden, tf.tensor([w_up]));

        plotter([hidden]);
        plotter2([out]);

        requestAnimationFrame(animate_point);
    }

    animate_point();
}

function d2_d2(id, p_down=w_down, p_up=w_up) {
    let elem = document.getElementById(id)
    let chart1 = document.createElement("div");
    chart1.id = `${id}-2D`;
    let chart2 = document.createElement("div");
    chart2.id = `${id}-2-2D`;

    elem.appendChild(chart1);
    elem.appendChild(chart2);

    // set up the plots 
    let plotter = plot(chart1.id, d2_layout, () => draw_line_2d(chart1, p_down));
    let plotter2 = plot(chart2.id, d2_layout, () => draw_line_2d(chart2, p_up));

    let get_points = default_2d_points();

    function animate_point() {
        let vectors = get_points();

        plotter([vectors]);
        let w = tf.tensor([p_down]).mul(tf.tensor([p_up]).transpose());
        plotter2([tf.einsum("bd, de -> be", vectors, w.transpose())]);

        requestAnimationFrame(animate_point);
    }

    animate_point();
}
