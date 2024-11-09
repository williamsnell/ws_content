function normal_distribution(x, mu, std) {
    return Math.exp(-((x - mu)**2) / (2 * std**2)) / Math.sqrt(2 * Math.PI * std**2)
}

function linspace(start, stop, num) {
    let step = (stop - start) / (num - 1);
    out = []
    for (let i = 0; i < num; i++) {
        out.push(start + i * step);
    }
    return out;
}

function integral_chart(id) {
    let elem = document.getElementById(id);
    let x_min = -7;
    let x_max = 7;
    const x = linspace(x_min, x_max, 1000);

    DEFAULT_2D_LAYOUT.xaxis.range = [x_min, x_max];
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


    let n_bars = 2;

    function draw_bars(n_bars) {
        const x_discrete = linspace(x_min, x_max, n_bars);
        const dx = x_discrete[1] - x_discrete[0];

        let x_bar = x_discrete.map((x) => x + dx/2);
        let y = x_discrete.map((x) => normal_distribution(x, 0, 1));

        var bar = {
            x: x_bar,
            y: y,
            width: dx,
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
        Plotly.react(id, [trace2, bar, scatter], DEFAULT_2D_LAYOUT, DEFAULT_CONFIG);
        console.log(y.reduce((partial_sum, yp) => partial_sum - dx * yp * Math.log2(dx * yp), 0));
        console.log(y.reduce((partial_sum, yp) => partial_sum - dx * yp, 0));
        // probability of landing in the median bin
        console.log(y[parseInt(n_bars / 2)] * dx);
    };

    Plotly.newPlot(id, [trace2], {...auto_sizing, ...DEFAULT_2D_LAYOUT}, DEFAULT_CONFIG);
    draw_bars(n_bars);

    document.getElementById(`${id} -`).addEventListener("click", (e) => {
        n_bars = Math.max(2, Math.ceil(n_bars / 1.5));
        draw_bars(n_bars);
    });

    document.getElementById(`${id} +`).addEventListener("click", (e) => {
        n_bars = Math.min(2**9, Math.ceil(n_bars * 1.5));
        draw_bars(n_bars);
    });
}
