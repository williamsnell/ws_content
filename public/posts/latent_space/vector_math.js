function uniformRandom(min=-1, max=1) {
  return Math.random() * (max - min) + min;
}

function vec(length, initializer) {
  return Array.from({length: length}, (x, i) => initializer());
}

function rand(num_vectors, vec_len, min=-1, max=1) {
  return vec(num_vectors, 
          () => vec(vec_len, 
            () => uniformRandom(min, max)));
}
