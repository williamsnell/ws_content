const options = {
  root: null,
  // Plots are activated when they are ahead of the 
  // user's viewport. They should be active by the
  // time they enter the screen.
  // They should be despawned when exiting the active area.
  rootMargin: "40% 0px 80% 0px", // top right bottom left
  threshold: 0.0,
  // We want to spawn when the plot fully enters the viewport,
  // and despawn when it fully exits. 
}

let plot_vtable = {};

function observer_callback(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!plot_vtable[entry.target.id].spawned) {
        entry.target.style.height = "auto";
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
    let elem = document.getElementById(id);

    let height = elem?.getBoundingClientRect().height;
    Plotly.purge(id);
    elem.style.height = `${height}px`;
    elem.innerHTML = "&nbsp;";
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

function spawn_plot_with_vector(container_id, spawn_callback) {
  let div = document.getElementById(container_id);
  if (div === null) throw(`No element found for ${container_id}.`);

  div.style.display = "inline-block";
  div.style.width = "100%";


  plot_vtable[container_id] = {
    spawn: () => {
      let plot_div = div.appendChild(document.createElement("div"));
      plot_div.id = `${container_id}_plot`;

      let vec_div = div.appendChild(document.createElement("div"));
      vec_div.id = `${container_id}_vec`;
  
      spawn_callback(plot_div.id, vec_div.id);
    },
    spawned: false,
    teardown: () => {
      let plot_div = document.getElementById(`${container_id}_plot`);
      let p_height = plot_div.getBoundingClientRect().height;
      let v_height = document.getElementById(`${container_id}_vec`)?.getBoundingClientRect().height;
      let height = `${p_height + v_height}px`;

      div.style.height = height;

      Plotly.purge(plot_div.id);

      div.innerHTML = "&nbsp;";
    }
  } 
  observer.observe(div);
}
function spawn_plot_with_gallery(container_id, spawn_callback) {
  return spawn_plot(container_id, spawn_callback, 
    (id) => {
      let elem = document.getElementById(id);

      let height = elem?.getBoundingClientRect().height;
      Plotly.purge(`${id}_plot_box_plotly`);
      elem.style.height = `${height}px`;
      elem.innerHTML = "&nbsp;";
      plot_vtable[id].spawned = false;
  });
}
