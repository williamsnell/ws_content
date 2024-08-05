const options = {
  root: null,
  // Plots are activated when they are ahead of the 
  // user's viewport. They should be active by the
  // time they enter the screen.
  // They should be despawned when exiting the active area.
  rootMargin: "10% 0px 30% 0px", // top right bottom left
  threshold: 0.0,
  // We want to spawn when the plot fully enters the viewport,
  // and despawn when it fully exits. 
}

let plot_vtable = {};

function observer_callback(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!plot_vtable[entry.target.id].spawned) {
        plot_vtable[entry.target.id].spawn(); 
        plot_vtable[entry.target.id].spawned = true;
      }
    } else {
      plot_vtable[entry.target.id].teardown();
      plot_vtable[entry.target.id].spawned = false;
    }
  })
}

let observer = new IntersectionObserver(observer_callback, options);

function spawn_plot(div_id, spawn_callback, 
  teardown_callback = (id) => {
    Plotly.purge(id);
    document.getElementById(id).innerHTML = "";
    plot_vtable[div_id].spawned = false;
  }) {
  let div = document.getElementById(div_id);
  if (div === null) throw(`No element found for ${div_id}.`);

  plot_vtable[div_id] = {
    spawn: () => spawn_callback(div_id),
    spawned: false,
    teardown: () => teardown_callback(div_id),
  }
  observer.observe(div);
}

function spawn_plot_with_vector(plot_id, vec_id, spawn_callback) {
  let div = document.getElementById(vec_id);
  if (div === null) throw(`No element found for ${vec_id}.`);
  
  plot_vtable[vec_id] = {
    spawn: () => spawn_callback(plot_id, vec_id),
    spawned: false,
    teardown: () => {
      document.getElementById(plot_id).innerHTML = "";
      document.getElementById(vec_id).innerHTML = "";
    }
  } 
  observer.observe(div);
}
