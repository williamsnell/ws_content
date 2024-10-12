function get_multi_plot_container(id, num_plots=2) {
    const plot_container = document.getElementById(id);

    if (plot_container === null) throw("element not defined");
    const width = plot_container.offsetWidth;

    let figs = [];
    for (let i = 0; i < num_plots; i++) {
        let fig = document.createElement("div");
        fig.id = `${id}_fig_${i}`;
        figs.push(fig);
    }

    if (width < MAX_SIDEBYSIDE_WIDTH) {
        // ------- Mobile layout ---------
        options_1.layout.width = width.toFixed(0);
        options_1.layout.height = width.toFixed(0);
        options_2.layout.width = width.toFixed(0);
        options_2.layout.height = width.toFixed(0);

        let button_bar = plot_container.appendChild(document.createElement("div"));
        button_bar.style.display = "flex";
        button_bar.style.gap = "10px 10px";
        // add tab buttons
        let d2_button = button_bar.appendChild(document.createElement("button"));
        d2_button.textContent = "2D";
        d2_button.id = `${id}_button_1`;
        d2_button.onclick = () => {

            Plotly.purge(fig_2.id);
            update_1 = get_2d_chart(vecs_2d, fig_2d.id, slice_offset, [axis_titles[0], axis_titles[1]], options_2d);

            d2_button.style.display = "none";
            d3_button.style.display = "block";
            fig_2.style.display = "none"; 
            fig_1.style.display = "block";
        };

        let d3_button = button_bar.appendChild(document.createElement("button"));
        d3_button.textContent = "3D";
        d3_button.id = `${id}_button_2`;
        d3_button.onclick = () => {
            Plotly.purge(fig_1.id);
            update_2 = get_3d_chart(vecs_3d, fig_3d.id, slice_offset, axis_titles, options_3d);
            d3_button.style.display = "none";
            d2_button.style.display = "block";
            fig_2.style.display = "block"; 
            fig_1.style.display = "none";
        };
        // activate the default tab
        plot_container.appendChild(fig_1);
        plot_container.appendChild(fig_2);

        // Set defaults
        d2_button.style.display = "none";
        fig_2.style.display = "none";
        update_1 = get_2d_chart(vecs_2d, fig_2d.id, slice_offset, [axis_titles[0], axis_titles[1]], options_2d);
    } else {
        //  ------- Tab layout ---------
        plot_container.style.display = "flex";
        fig_1.style.borderRight = `1px solid ${theme_text_color}`;
        plot_container.appendChild(fig_1);
        plot_container.appendChild(fig_2);

        options_1.layout.width = (width * 0.5).toFixed(0);
        options_1.layout.height = (width * 0.5).toFixed(0);
        options_2.layout.width = (width * 0.5).toFixed(0);

        update_1 = get_2d_chart(vecs_2d, fig_2d.id, slice_offset, [axis_titles[0], axis_titles[1]], options_2d);
        update_2 = get_3d_chart(vecs_3d, fig_3d.id, slice_offset, axis_titles, options_3d);
    }
}
