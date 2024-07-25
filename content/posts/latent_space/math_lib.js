
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
