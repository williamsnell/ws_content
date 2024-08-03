function slice_arrays(index, array) {
  let x = [];
  let y = []; 
  let z = []; 

  if (array[0].length == 1) {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(0.);
      z.push(0.);
    }
  }
  else if (array[0].length == 2) {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(array[i][index + 1]);
      z.push(0.);
    }
  }
  else {
    for (let i = 0; i < array.length; i++) {
      x.push(array[i][index]);
      y.push(array[i][index + 1]);
      z.push(array[i][index + 2]);
    }
  }

  return [x, y, z];
}

function vec(length, initializer) {
  return Array.from({length: length}, (x, i) => initializer());
}

function uniformRandom(min=-1, max=1) {
  return Math.random() * (max - min) + min;
}

function rand(num_vectors, vec_len, min=-1, max=1) {
  return vec(num_vectors, 
          () => vec(vec_len, 
            () => uniformRandom(min, max)));
}

function gaussianRandom(mean=0, stdev=1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt( -2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function randn(num_vectors, vec_len, mean=0, variance=1) {
  return vec(num_vectors, 
          () => vec(vec_len, 
            () => gaussianRandom(mean, variance)));
}

function vec_norm(vec, dimensions) {
  let acc = 0;
  if (dimensions > vec.length) throw(
    `Cannot calculate ${dimensions}-dim norm when the 
    vector passed had shape ${vec.length}`);

  for (var i = 0; i < dimensions; i++) {
    acc += vec[i]**2;
  }
  return Math.sqrt(acc);
}

function distance(vec1, vec2, dimensions) {
  let difference = [];
  if (vec1.length != vec2.length) throw("Vectors should have same size.");
  if (vec1.length < dimensions) throw("dimensions exceeds length of vector.");
  for (let i = 0; i < dimensions; i++) {
    difference.push(vec1[i] - vec2[i]);
  }
  return vec_norm(difference, dimensions);
}

// Pass elem2 = null to plot circular coordinates instead of spherical
//
// dimensions lets the user explicitly pass how much of the 
// vector to use.
function _vec_to_spherical(vec, dimensions, elem0=0, elem1=1, elem2=2) {
  if (dimensions == 1) {
    return [vec[elem0], 0, 0];
  }
  const norm = vec_norm(vec, dimensions);

  if (dimensions == 2) {
    // This feels like cheating, but really 
    // we don't need to do anything up until 
    // 4 dimensions
    return [vec[elem0], vec[elem1], 0];
  }
  
  // elem2 can be null, in which case the 
  // coordinates are circular, not spherical
  let v2;
  if (elem2 == null) {
    v2 = 0.0; 
  } else {
    v2 = vec[elem2];
  }
  
  const dir_norm = vec_norm([vec[elem0], vec[elem1], v2], 3);
  const mag = norm / dir_norm;
  return [vec[elem0] * mag, vec[elem1] * mag, vec[elem2] * mag];
}

function vecs_to_spherical(vecs, dimensions, elem0=0, elem1=1, elem2=2) {
  let out = [];
  for (let i = 0; i < vecs.length; i++) {
    out.push(_vec_to_spherical(vecs[i], dimensions, elem0, elem1, elem2));
  }
  return [out, 0];
}
