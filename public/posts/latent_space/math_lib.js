const VEC_ELEMS_DISPLAYED = 8;
const AVAILABLE_DIMENSIONS = [1, 2, 3, 4, 5, 6, 10, 20, 50, 100, 1000];


function latexize_vector(vector, element_id) {
  let latex_str = `
\\[
  \\begin{align}
    \\vec{v} = \\begin{bmatrix}`;

  for (let i = 0; i < vector.length; i++) {
    latex_str += `${vector[i].toFixed(2)} \\\\`
  }
  latex_str += `\\end{bmatrix}
              \\end{align}
            \\]`;
  document.getElementById(element_id).innerHTML = latex_str;
}

function latexize_vector(vector, element_id, slice_offset, dimensions, num_selected) {
  if (dimensions > vector.length) throw("Dimensions > vector length");
  let latex_str = `
    \\[
    \\begin{align}
\\vec{v_{${dimensions}}} = \\begin{bmatrix}`;

  const start = Math.max(0, Math.min(slice_offset, dimensions - VEC_ELEMS_DISPLAYED));
  const desired_stop = Math.min(dimensions, slice_offset + VEC_ELEMS_DISPLAYED);
    
  // Adding dots increases the size of the vector, so we need
  // this check to stop the vector increasing and decreasing
  // in length as we scroll through.
  const stop = (start > 0 && desired_stop < dimensions) ? desired_stop - 1 : desired_stop;

  if (start > 0) latex_str += `\\vdots \\\\`;
  for (let i = start; i < stop; i++) {
    if ((i - slice_offset) >= 0 && (i - slice_offset) < num_selected) {
      latex_str += `\\mathbf{${vector[i].toFixed(2)}} \\\\`
    } else {
      latex_str += `${vector[i].toFixed(2)} \\\\`
    }
  }
  if (stop < dimensions) latex_str += `\\vdots \\\\`;

  latex_str += `\\end{bmatrix}
              \\end{align}
            \\]`;
  document.getElementById(element_id).innerHTML = latex_str;
}

function get_vector_widget(vector, id, callback=async (dimensions, slice_offset)=>{}, start_dims=0, start_offset=0, num_selected=2) {
  let current_dims = start_dims;
  let current_offset = start_offset;

  const container = document.getElementById(id);
  if (container === null) throw(`Element id=${id} doesn't exist.`);
  const dim_plus = container.appendChild(document.createElement("button"));
  const dim_minus = container.appendChild(document.createElement("button"));
  const slice_plus = container.appendChild(document.createElement("button"));
  const slice_minus = container.appendChild(document.createElement("button"));
  
  const vec_div = container.appendChild(document.createElement("div"));
  vec_div.id = id + "_vec_div";

  async function redraw_vec() {
    latexize_vector(vector, vec_div.id, current_offset, AVAILABLE_DIMENSIONS[current_dims], num_selected);
    await callback(AVAILABLE_DIMENSIONS[current_dims], current_offset);
    await window.MathJax.typesetPromise();
  }

  redraw_vec();


  // create +dimensions button
  dim_plus.textContent = "dim+";
  dim_plus.onclick = () => {
    if (AVAILABLE_DIMENSIONS[current_dims + 1] <= vector.length) {
      current_dims = current_dims + 1
      redraw_vec();
    };
  };
  // create -dimensions button
  dim_minus.textContent = "dim-";
  dim_minus.onclick = () => {
    current_dims = Math.max(0, current_dims - 1);
    current_offset = Math.max(Math.min(current_offset, AVAILABLE_DIMENSIONS[current_dims] - num_selected), 0);
    redraw_vec();
  }; 
  // create +slice button
  slice_plus.textContent = "slice+";
  slice_plus.onclick = () => {
    current_offset = Math.max(Math.min(AVAILABLE_DIMENSIONS[current_dims] - num_selected, current_offset + 1), 0); 
    redraw_vec();
  };

  // create -slice button
  slice_minus.textContent = "slice-";
  slice_minus.onclick = () => {
    current_offset = Math.max(0, current_offset - 1); 
    redraw_vec();
  };
}
