import {DEFAULT_CONFIG, DEFAULT_MARKERS, DEFAULT_2D_LAYOUT, DEFAULT_AXIS_FONT, colors, theme_text_color, accent_color} from "./config.js";

function normal_distribution(x, mu, std) {
    return Math.exp(-((x - mu)**2) / (2 * std**2)) / Math.sqrt(2 * Math.PI * std**2)
}


// From https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve 
function sample_normal(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function linspace(start, stop, num) {
    let step = (stop - start) / (num - 1);
    let out = []
    for (let i = 0; i < num; i++) {
        out.push(start + i * step);
    }
    return out;
}

export function normal_chart(id) {
    let elem = document.getElementById(id);
    let x_min = -7;
    let x_max = 7;
    const x = linspace(x_min, x_max, 1000);

    let layout = structuredClone(DEFAULT_2D_LAYOUT);

    layout.xaxis.range = [x_min, x_max];
    layout.xaxis.zeroline = true;
    layout.xaxis.title = {text: "x", font: DEFAULT_AXIS_FONT};
    layout.yaxis.zeroline = true;
    layout.yaxis.title = {text: "Probability Density p(x)", font: DEFAULT_AXIS_FONT};

    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 600).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }

    var trace2 = {
        x: x,
        y: x.map((x) => normal_distribution(x, 0, 1)),
        mode: 'lines',
        type: 'scatter',
        marker: DEFAULT_MARKERS,
    };
    Plotly.newPlot(id, [trace2], {...auto_sizing, ...layout}, DEFAULT_CONFIG);
}

export function normal_sample_chart(id) {
    let elem = document.getElementById(id);
    let x_min = -7;
    let x_max = 7;
    const x = linspace(x_min, x_max, 100);

    let layout = structuredClone(DEFAULT_2D_LAYOUT);

    layout.xaxis.range = [x_min, x_max];
    layout.xaxis.zeroline = true;
    layout.xaxis.title = {text: "x", font: DEFAULT_AXIS_FONT};
    layout.yaxis.zeroline = true;
    layout.yaxis.range = [-0.05, 0.05];

    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 200).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }
    
    let markers = structuredClone(DEFAULT_MARKERS);
    markers.size = 2;

    var trace2 = {
        x: x.map((x) => sample_normal()),
        y: x.map((x) => 0),
        mode: 'markers',
        type: 'scatter',
        marker: markers,
    };
    Plotly.newPlot(id, [trace2], {...auto_sizing, ...layout}, DEFAULT_CONFIG);
}

export function integral_chart(id, divergence=false) {
    // Set up all the sub-elements because these 
    // need to be created/torn down on scroll.
    let container = document.getElementById(id);
    let elem = container.appendChild(document.createElement("div"));
    elem.id = id + " chart";

    if (divergence) {
        let history = container.appendChild(document.createElement("div"));
        history.id = id + " history";
    }

    let button_bar = container.appendChild(document.createElement("div"));
    button_bar.id = id + " button-bar";
    button_bar.classList.add("button_bar");

    let minus = button_bar.appendChild(document.createElement("button"));
    minus.id = id + " -";
    minus.classList.add("mi_buttons");
    minus.textContent = "Fewer Bins";

    let plus = button_bar.appendChild(document.createElement("button"));
    plus.id = id + " +";
    plus.classList.add("mi_buttons");
    plus.textContent = "More Bins";

    let text_elem = container.appendChild(document.createElement("div"));
    text_elem.id = id + " text";
    text_elem.style = "margin-left: 100px;" + (divergence ? " display: none;" : "");
    
    let n_bars = 2;
    let min_bars = 2;
    let max_bars = 2**9;

    let x_min = -7;
    let x_max = 7;
    const x = linspace(x_min, x_max, 1000);

    let layout = structuredClone(DEFAULT_2D_LAYOUT);

    layout.xaxis.range = [x_min, x_max];

    let auto_sizing = {
        width: Math.min(elem.offsetWidth, 600).toFixed(0),
        height: Math.min(elem.offsetWidth, 600).toFixed(0),
        margin: {t: 0, l: 0, r: 0, b: 0},
    }

    var trace2 = {
        x: x,
        y: x.map((x) => normal_distribution(x, 0, 1)),
        mode: 'lines',
        type: 'scatter',
        marker: DEFAULT_MARKERS,
    };

    var trace3 = {};
    if (divergence) {
        let m = structuredClone(DEFAULT_MARKERS);
        m.color = colors[1];
        trace3 = {
            x: x,
            y: x.map((x) => normal_distribution(x, 3, 2)),
            mode: 'lines',
            type: 'scatter',
            marker: m
        };
    }
    
    let history = [];

    function draw_bars(n_bars) {
        const x_discrete = linspace(x_min, x_max, n_bars);
        const dx = x_discrete[1] - x_discrete[0];

        const midpoint = parseInt(n_bars/2);

        let y = x_discrete.map((x) => normal_distribution(x, 0, 1));

        var bar = {
            x: x_discrete,
            y: y,
            width: dx,
            offset: 0,
            type: 'bar',
            marker: {
                color: accent_color,
                opacity: 0.8,
                line: {
                    width: Math.min(1, Math.floor(dx * 4)),
                }
            },

        };

        var scatter = {
            x: x_discrete,
            y: y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: accent_color,
                size: n_bars < 50 ? 5 : 1,
                line: {
                    width: 0
                }
            },

        };

        let bar2 = {};
        let scatter2 = {};
        let y2;

        if (divergence) {
            y2 = x_discrete.map((x) => normal_distribution(x, 3, 2));
            bar2 = {
                x: x_discrete,
                y: y2,
                offset: 0,
                width: dx,
                type: 'bar',
                marker: {
                    color: colors[1],
                    opacity: 0.8,
                    line: {
                        width: Math.min(1, Math.floor(dx * 4)),
                    }
                },

            };

            scatter2 = {
                x: x_discrete,
                y: y2,
                type: 'scatter',
                mode: 'markers',
                marker: {
                    color: colors[1],
                    size: n_bars < 50 ? 5 : 1,
                    line: {
                        width: 0
                    }
                },

            };
        };

        if (dx > 0.25) {
            var arrow = {
                x: [x_discrete[midpoint - 1], x_discrete[midpoint]],
                y: [0, 0],
                type: 'scatter',
                mode: 'lines+markers',
                marker: {
                    size: 8,
                    color: theme_text_color,
                    symbol: "line-ew",
                }
            };
            
            // Annotate Delta x
            layout.annotations = [
                {
                    x: 0.5 * (x_discrete[midpoint] + x_discrete[midpoint - 1]),
                    y: -0.05,
                    text: 'Δx',
                    showarrow: false,
                    font: DEFAULT_AXIS_FONT,
                    arrowhead: 1,
                    arrowcolor: theme_text_color,
                }
            ];
        } else {
            arrow = {};
            layout.annotations = [];
        }

        Plotly.react(elem, [trace2, bar, scatter, trace3, bar2, scatter2, arrow], layout);
        // Update the text elements, too
        history.push({
            n: n_bars,
            p: -y.reduce((partial_sum, yp) => partial_sum - dx * yp, 0),
            h: y.reduce((partial_sum, yp) => partial_sum - dx * yp * Math.log2(dx * yp), 0),
        });


        if (divergence) {
            history[history.length - 1].d = Array(y.length).fill(0).reduce((partial_sum, _, i) => partial_sum + dx * y[i] * Math.log2(y[i] / y2[i]), 0);
        }

        history.sort((a, b) => a.n - b.n);

        text_elem.textContent = `$$
        \\begin{align}
        \\Delta x &= ${dx.toPrecision(2)} \\\\
        \\int_{-\\infty}^{\\infty} p(x) dx &\\approx ${history[history.length - 1].p.toPrecision(6)} \\\\
        H(X) &\\approx ${history[history.length - 1].h.toFixed(3)} \\\\
        \\end{align}$$`;

        if (divergence) {
            text_elem.textContent += `$$D_{KL} (p || q) = ${
                history[history.length - 1].d.toFixed(5)} $$`;

            let traces = [
            {
                x: history.map((x) => x.n),
                y: history.map((x) => x.p),
                name: 'P(X)',
                line: {
                    color: colors[0],
                },
            },
            {
                x: history.map((x) => x.n),
                y: history.map((x) => x.d),
                name: 'Dₖₗ (p || q)',
                line: {
                    color: colors[1],
                },
            },
            {
                x: history.map((x) => x.n),
                y: history.map((x) => x.h),
                name: 'h(X)',
                line: {
                    color: colors[3],
                },
            },
            ];
            let layout2 = structuredClone(DEFAULT_2D_LAYOUT);

            layout2.xaxis = {
                showgrid: false,
                type: 'log',
                range: [Math.log(min_bars) / Math.log(10), Math.log(max_bars) / Math.log(10)],
                title: {
                    text: "Number of Bins",
                    font: DEFAULT_AXIS_FONT,
                }
            }
            layout2.yaxis = {
                showgrid: false,
                range: [0, 7],
                zeroline: true,
            }
            layout2.showlegend = true;
            layout2.legend = {
                font: DEFAULT_AXIS_FONT,
            };
            layout2.shapes = [
                {
                    type: 'rect',
                    xref: 'x',
                    yref: 'paper',
                    x0: n_bars,
                    y0: 0,
                    x1: n_bars,
                    y1: 1,
                    fillcolor: theme_text_color,
                    line: {
                        width: 1,
                        color: theme_text_color,
                    }
                }
            ];

            let auto_sizing2 = {
                width: Math.min(elem.offsetWidth, 600).toFixed(0),
                height: Math.min(elem.offsetWidth, 300).toFixed(0),
                margin: {t: 0, l: 0, r: 0, b: 0},
            }

            Plotly.newPlot(id + " history", traces, {...auto_sizing2, ...layout2}, DEFAULT_CONFIG);
        }
        if (MathJax) {
            MathJax.typeset([text_elem]);
        };

        if (n_bars <= min_bars) { minus.style.opacity = 0.2; } else { minus.style.opacity = 1;}
        if (n_bars >= max_bars) { plus.style.opacity = 0.2; } else { plus.style.opacity = 1;}
    };

    Plotly.newPlot(elem.id, [trace2], {...auto_sizing, ...layout}, DEFAULT_CONFIG);
    draw_bars(n_bars);
    minus.addEventListener("click", (e) => {
        n_bars = Math.max(min_bars, Math.ceil(n_bars / 2));
        draw_bars(n_bars);
    });

    plus.addEventListener("click", (e) => {
        n_bars = Math.min(max_bars, Math.ceil(n_bars * 2));
        draw_bars(n_bars);
    });
}
