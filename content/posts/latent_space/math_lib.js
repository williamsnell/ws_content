const VEC_ELEMS_DISPLAYED = 8;
const AVAILABLE_DIMENSIONS = [1, 2, 3, 4, 5, 6, 10, 20, 50, 100, 1000];

function make_latex_vectors(vector, element_id, slice_offset, dimensions, num_selected) {
  if (dimensions > vector.length) throw("Dimensions > vector length");

  let prelude = `\\[
    \\begin{align}`;

  let v = latexize_vector(vector.map((x, i) => `x_{${i+1}}=${x.toFixed(2)}`), 
    `\\vec{v}_{${dimensions}}`, slice_offset, dimensions, num_selected);
  let spherical_vec = [
    `r = ${(vec_norm(vector, dimensions) * ((dimensions == 1) ? Math.sign(vector[0]) : 1)).toFixed(2)}`,
      ];
  if (dimensions > 1) {
    spherical_vec.push(`\\theta_1 = f(x_{${slice_offset+1}}, x_{${slice_offset+2}})`);
    //spherical_vec.push(`\\theta_1 = ${Math.atan2(vector[slice_offset + 1], vector[slice_offset]).toFixed(2)}`);
  } 
  if (dimensions > 2) {
    spherical_vec.push(`\\theta_2 = f(x_{${slice_offset+2}}, x_{${slice_offset+3}})`);
    //spherical_vec.push(`\\theta_2 = ${Math.atan2(vector[slice_offset + 2], vector[slice_offset + 1]).toFixed(2)}`);
  }
  let s3d = latexize_vector(spherical_vec, `    \\vec{s}_{${Math.min(3, dimensions)}}`, 0, Math.min(dimensions, 3), Math.min(dimensions, 3));

  let epilogue = `\\end{align}
            \\]`;

  document.getElementById(element_id).innerHTML = prelude + v + "\\mapsto " + s3d + epilogue;
}

function latexize_vector(vector, vec_name, slice_offset, dimensions, num_selected, symbols=null) {
    let latex_str = `${vec_name} = \\begin{bmatrix}`;

  const start = Math.max(0, Math.min(slice_offset, dimensions - VEC_ELEMS_DISPLAYED));
  const desired_stop = Math.min(dimensions, slice_offset + VEC_ELEMS_DISPLAYED);
    
  // Adding dots increases the size of the vector, so we need
  // this check to stop the vector increasing and decreasing
  // in length as we scroll through.
  const stop = (start > 0 && desired_stop < dimensions) ? desired_stop - 1 : desired_stop;

  if (start > 0) latex_str += `\\vdots \\\\`;
  for (let i = start; i < stop; i++) {
    if ((i - slice_offset) >= 0 && (i - slice_offset) < num_selected) {
      latex_str += `${vector[i]} \\\\`
    } else {
      latex_str += `${vector[i]} \\\\`
    }
  }
  if (stop < dimensions) latex_str += `\\vdots \\\\`;

  latex_str += `\\end{bmatrix}`;

  return latex_str;
}

function get_vector_widget(vector, id, callback=async (dimensions, slice_offset)=>{}, start_dims=0, start_offset=0, num_selected=3) {
  let current_dims = start_dims;
  let current_offset = start_offset;

  const container = document.getElementById(id);
  if (container === null) throw(`Element id=${id} doesn't exist.`);

  const wrapper = container.appendChild(document.createElement("div"));
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "center";

  const button_bar = wrapper.appendChild(document.createElement('div'));
  button_bar.style.display = "flex";
  button_bar.style.flexWrap = "wrap";
  button_bar.style.gap = "10px 20px";
  button_bar.style.width = "calc(min(400px, 100%))";
  button_bar.style.paddingTop = "20px";
  button_bar.style.justifyContent = "center";

  const dim_minus = button_bar.appendChild(document.createElement("button"));
  const dim_plus = button_bar.appendChild(document.createElement("button"));
  const slice_minus = button_bar.appendChild(document.createElement("button"));
  const slice_plus = button_bar.appendChild(document.createElement("button"));
  
  const vec_div = container.appendChild(document.createElement("div"));
  vec_div.id = id + "_vec_div";

  function activate_elements_buttons(dimension, num_selected) {
    if (dimension > num_selected) {
      slice_minus.style.display = "block";
      slice_plus.style.display = "block";
    } else {
      slice_minus.style.display = "none";
      slice_plus.style.display = "none";
    }
  }

  async function redraw_vec() {
    activate_elements_buttons(AVAILABLE_DIMENSIONS[current_dims], num_selected);
    make_latex_vectors(vector, vec_div.id, current_offset, AVAILABLE_DIMENSIONS[current_dims], num_selected);
    await callback(AVAILABLE_DIMENSIONS[current_dims], current_offset);
    await window.MathJax.typesetPromise();
  }

  redraw_vec();


  // create +dimensions button
  dim_plus.textContent = "Dimensions (+)";
  dim_plus.style.width = "calc(min(180px, 45%))";
  dim_plus.onclick = () => {
    if (AVAILABLE_DIMENSIONS[current_dims + 1] <= vector.length) {
      current_dims = current_dims + 1
      redraw_vec();
    };
  };
  // create -dimensions button
  dim_minus.textContent = "Dimensions (-)";
  dim_minus.style.width = "calc(min(180px, 45%))";
  dim_minus.onclick = () => {
    current_dims = Math.max(0, current_dims - 1);
    current_offset = Math.max(Math.min(current_offset, AVAILABLE_DIMENSIONS[current_dims] - num_selected), 0);
    redraw_vec();
  }; 
  // create +slice button
  slice_plus.textContent = "Elements (+)";
  slice_plus.style.width = "calc(min(180px, 45%))";
  slice_plus.onclick = () => {
    current_offset = Math.max(Math.min(AVAILABLE_DIMENSIONS[current_dims] - num_selected, current_offset + 1), 0); 
    redraw_vec();
  };

  // create -slice button
  slice_minus.textContent = "Elements (-)";
  slice_minus.style.width = "calc(min(180px, 45%))";
  slice_minus.onclick = () => {
    current_offset = Math.max(0, current_offset - 1); 
    redraw_vec();
  };
}
