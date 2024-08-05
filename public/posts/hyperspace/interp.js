
// lerp

function lerp(fraction, start, stop, dimensions) {
  let out = [];
  for (var i = 0; i < start.length; i++) {
    out[i] = start[i] + fraction * (stop[i] - start[i]);
  }
  return out;
}

function _v(func, array) {
  // Apply a function along a vector.
  return array.map((x) => func(x));
}

function clamp(val, min, max) {
  // Mirror's numpy's 'clip' function
  return Math.max(min, Math.min(val, max));
}

function mult(array, num) {
  // elemwise multiplication
  return array.map((x) => x * num);
}

function add(array, num) {
  // elemwise multiplication
  return array.map((x) => x + num);
}

function dot(arr1, arr2) {
  // Implicitly assumes arr1 and arr2 
  // have the same length.
  let acc = 0;
  for (var i = 0; i < arr1.length; i++) {
    acc += arr1[i] * arr2[i]; 
  }
  return acc;
}

function slerp(fraction, start, stop, dimensions) {
  const norm_start = mult(start.slice(0, dimensions), 1 / vec_norm(start, dimensions));
  const norm_stop = mult(stop.slice(0, dimensions), 1 / vec_norm(stop, dimensions));

  const omega = Math.acos(clamp(dot(norm_start, norm_stop), -1, 1));
  const so = Math.sin(omega);

  let out = new Array(start.length);

  if (so == 0) {
    for (let i = 0; i < start.length; i++) {
      out[i] = (1.0 - fraction) * start[i] + fraction * stop[i];
    }
  }
  else {
    let s_omega_minus = Math.sin((1.0 - fraction) * omega) / so;
    let s_omega_plus = Math.sin(fraction * omega) / so;
    for (let i = 0; i < start.length; i++) {
      out[i] = s_omega_minus * start[i] + s_omega_plus * stop[i];
    }
  }
  return out;
}

function slerp2(fraction, start, stop, dimensions) {
  const q1_mag = vec_norm(start, dimensions);
  const q2_mag = vec_norm(stop, dimensions);

  const q1_norm = mult(start.slice(0, dimensions), 1 / q1_mag);
  const q2_norm = mult(stop.slice(0, dimensions), 1 / q2_mag);

  const theta = Math.acos(clamp(dot(q1_norm, q2_norm), -1, 1));
  const so = Math.sin(theta);
  
  let out = new Array(start.length);
 
  if (so == 0) {
    for (let i = 0; i < start.length; i++) {
      out[i] = (1.0 - fraction) * start[i] + fraction * stop[i];
    }
  }
  else {
    let s_theta_1 = Math.sin((1.0 - fraction) * theta) / so;
    let s_theta_2 = Math.sin(fraction * theta) / so;
    
    let lerp_magnitude = q1_mag + fraction * (q2_mag - q1_mag);

    for (let i = 0; i < start.length; i++) {
      out[i] = lerp_magnitude * (s_theta_1 * q1_norm[i] + s_theta_2 * q2_norm[i]);
    }
  }
  return out; 
}

// Returns an array of vectors, i.e. NOT transformed into x, y, z
// TODO add dimensions to save unnecessary calculations
function get_interp_path(start_vec, stop_vec, interpolator, dimensions, num_steps=500) {
  let tweens = Array.from({ length: num_steps}, (v, i) => i / (num_steps - 1));
  
  return tweens.map((fraction) => interpolator(fraction, start_vec, stop_vec, dimensions));
}

function draw_2d_interp(chart_id, start_vec, stop_vec, dimensions, interpolator, 
    vector_position=0, transform=null, trace_settings={mode: 'lines'}, num_steps=500) {
  
  function transform_vecs(dimensions, vector_position) {
    let interp_path = get_interp_path(start_vec, stop_vec, interpolator, dimensions, num_steps);
    let offset;
    let p_x, p_y, _;
    if (transform !== null) {
      [interp_path, offset] = transform(interp_path, dimensions, vector_position, vector_position+1, null);
      [p_x, p_y, _] = slice_arrays(offset, interp_path);
    } else {
      [p_x, p_y, _] = slice_arrays(vector_position, interp_path);
    }

    return [p_x, p_y];
  }

  let [p_x, p_y] = transform_vecs(dimensions, vector_position);

  let redraw_chart = add_line_2d(chart_id, p_x, p_y, trace_settings);

  function redraw_interp(dimensions, vector_position) {
    let [p_x, p_y] = transform_vecs(dimensions, vector_position);
    redraw_chart(p_x, p_y);
  }
  
  return redraw_interp;
}

function draw_3d_interp(chart_id, start_vec, stop_vec, dimensions, interpolator, 
    vector_position=0, transform=null, trace_settings={mode: 'lines'}, num_steps=500) {
 
  function transform_vecs(dimensions, vector_position) {
    let interp_path = get_interp_path(start_vec, stop_vec, interpolator, dimensions, num_steps);
    let offset;
    let p_x, p_y, p_z;
    if (transform !== null) {
      [interp_path, offset] = transform(interp_path, dimensions, vector_position, vector_position+1, vector_position+2);
      [p_x, p_y, p_z] = slice_arrays(offset, interp_path);
    } else {
      [p_x, p_y, p_z] = slice_arrays(vector_position, interp_path);
    }

    return [p_x, p_y, p_z];
  }

  let [p_x, p_y, p_z] = transform_vecs(dimensions, vector_position);

  let redraw_chart = add_line_3d(chart_id, p_x, p_y, p_z, trace_settings);

  function redraw_interp(dimensions, vector_position) {
    let [p_x, p_y, p_z] = transform_vecs(dimensions, vector_position);
    redraw_chart(p_x, p_y, p_z);
  }
  
  return redraw_interp;
}

