import digamma from 'https://cdn.jsdelivr.net/gh/stdlib-js/math-base-special-digamma@esm/index.mjs';

export {KDTree, normalize};

class Node {
    constructor(val, less_than, greater_than) {
        this.val = val;
        this.less_than = less_than;
        this.greater_than = greater_than;
    }
}

class KDTree {
    constructor(points) {
        this.n_dimensions = points[0].length;
        this.tree = this.build_tree(points, 0, this.n_dimensions);
    }
    build_tree(points, dim, n_dims) {
        if (points.length == 1) {
            return new Node(points[0], null, null);
        }
        // sort a subset of the points
        const n_subset = Math.min(points.length, Math.min(200, Math.max(10, parseInt(points.length / 10))));
        //const n_subset = points.length;
        // assume the area is homogeneous, so we can
        // just pick the first n_subset points.
        let subset = points.slice(0, Math.min(points.length, n_subset)).map((x, i) => x.concat([i]));
        subset.sort((a, b) => a[dim] - b[dim]);
        let midpoint = subset[parseInt(subset.length / 2)][subset[0].length - 1];
        let median = points[midpoint];
        let median_elem = median[dim];
        // Remove the median so we don't count it twice.
        points = points.slice(0, midpoint).concat(points.slice(midpoint + 1));
        
        let next_dim = (dim + 1) % n_dims;

        let points_leq = points.filter((x) => x[dim] <= median_elem);
        let points_gt = points.filter((x) => x[dim] > median_elem);

        let less_than, greater_than;
        
        if (points_leq.length > 0) {
            less_than = this.build_tree(points_leq, next_dim, n_dims);
        }
        if (points_gt.length > 0) {
            greater_than = this.build_tree(points_gt, next_dim, n_dims);
        }

        return new Node(median, less_than, greater_than);
    }

    knn(point, k, return_dist=false) {
        let closest_points = []; // [[distance, *point]]
        let n_dimensions = this.n_dimensions;

        function distance(x, y, norm=Math.inf) {
            if (norm == Math.inf) {
                return Math.max(...x.map((x, i) => Math.abs(x - y[i])));
            }
            return x.reduce((partial_sum, x, i) => partial_sum + (x-y[i])**norm, 0);
        }

        // find the point where the 

        function find_closest(node, dim=0) {
            let match = node.val;

            let gt = point[dim] > node.val[dim];

            if (node.greater_than && gt) {
                find_closest(node.greater_than, (dim + 1) % n_dimensions);
            } else if (node.less_than && !gt) {
                find_closest(node.less_than, (dim + 1) % n_dimensions);
            }

            // At this point, we've greedily explored on the 
            // "best" side of the tree.
                let dist = distance(point, match);

            if (closest_points.length < k) {
                closest_points.push([dist].concat(match));
            } else if (dist < closest_points[0][0]) {
                closest_points[0] = [dist].concat(match);
            }
            closest_points.sort((a, b) => b[0] - a[0]);

            // Check if the distance to the splitting plane
            // is less than the distance to the furthest
            // neighbor.
            if (closest_points[0][0] > distance([point[dim]], [node.val[dim]]) || closest_points.length < k) {
                // If so, traverse the opposite tree to last time.
                    if (node.greater_than && !gt) {
                        find_closest(node.greater_than, (dim + 1) % n_dimensions);
                    } else if (node.less_than && gt) {
                        find_closest(node.less_than, (dim + 1) % n_dimensions);
                    }
            }

            return node.val;
        }

        find_closest(this.tree);
        if (return_dist) {
            return [closest_points.map((x) => x.slice(1)), closest_points.map((x) => x[0])];
        }
        return closest_points.map((x) => x.slice(1));
    }

    /* Find the points bounded by some range.
    *  bounds is an array of [d_min, d_max].
    *      e.g. for 3D, [[x_min, x_max], [y_min, y_max], [z_min, z_max]]
    */ 
    find_bounded(bounds) {
        let points = [];
        let n_dims = this.n_dimensions;

        function recursively_bound(node, depth=0) {
            let dim = depth % n_dims;

            let splitting_plane = node.val[dim];
            let [left_bound, right_bound] = bounds[dim];

            let lt = left_bound <= splitting_plane;
            let gt = right_bound > splitting_plane;

            if (lt && gt) {
                // Check if the current point is bounded
                // on all sides
                let bounded = true;
                for (let i = 0; i < bounds.length; i++) {
                    if (bounds[i][0] > node.val[i] || bounds[i][1] <= node.val[i]) {
                        bounded = false;
                        break;
                    }
                }
                if (bounded) { points.push(node.val) };

                // Continue refining on both sides.
                node.less_than ? recursively_bound(node.less_than, depth+1) : null;
                node.greater_than ? recursively_bound(node.greater_than, depth+1) : null;
            } else if (lt) {
                // bounding box is entirely on the 
                // less-than side of the tree
                node.less_than ? recursively_bound(node.less_than, depth + 1) : null;
            } else if (gt) {
                // bounding box is entirely on the greater-than
                // side of the tree.
               node.greater_than ? recursively_bound(node.greater_than, depth + 1) : null; 
            }
        }
        recursively_bound(this.tree);
        return points;
    }
}

// From https://stackoverflow.com/questions/27659675/get-next-smallest-nearest-number-to-a-decimal
export function get_epsilon(n) {
  return Math.max( Number.MIN_VALUE, 2 ** Math.floor( Math.log2( n ) ) * Number.EPSILON ) 
}

// Rescale each dimension to have a mean of 0 and variance of 1. Since mutual information
// is invariant under invertible maps, this leaves the true MI unchanged but improves the 
// quality of estimates (at least, according to https://arxiv.org/pdf/cond-mat/0305641)
function normalize(points) {
    let out = Array(points.length).fill(0).map(() => new Array(points[0].length).fill(0));

    for (let dim = 0; dim < points[0].length; dim++) {
        let mean = points.reduce((partial_sum, x) => partial_sum + x[dim], 0) / points.length;
        let centred = points.map((x) => x[dim] - mean);
        let std = (centred.reduce((partial_sum, x) => partial_sum + x**2, 0) / points.length)**0.5;
        for (let i = 0; i < points.length; i++) {
            out[i][dim] =  centred[i] / std;
        }
    }

    return out;
}


/* Estimate the Mutual Information of a collection
   of signals.

   x_points: An [n x m] dimensional array, with
             m unique signals and n samples.

   returns: I(X1, X2, ... Xm)

*/ 
function mutual_information(x_points, k=3) {
    let joint_samples = normalize(x_points);

    let m = x_points[0].length;
    let n_samples = x_points.length;

    let joint_tree = new KDTree(joint_samples);

    let marginal_trees = [];

    for (let signal = 0; signal < m; signal++) {
        marginal_trees.push(new KDTree(joint_samples.map((x, i) => [x[signal]])));
    }

    // Across all n_x[m], compute digamma(n_x[m] + 1), and then
    // take the mean.
    let mean_psi_nxm = joint_samples.reduce((partial_sum, x, i) => 
    {
            // We find k + 1 neighbors because the first neighbor is the point itself.
            let [neighbors, dists] = joint_tree.knn(x, k + 1, true);
            // We add an offset because we don't want a point on the wall of our hypercube
            // to be caught by our hyper rectangles.
            let bound_length = dists[0] - get_epsilon(dists[0]);

            let digamma_sum = 0;

            for (let signal = 0; signal < m; signal++) {
                let bounds = [[x[signal] - bound_length, x[signal] + bound_length]];
                // n_xm = (length - 1) because we will always find the search point, and 
                // need to ignore it.
                let n_xm = marginal_trees[signal].find_bounded(bounds).length - 1;
                digamma_sum += digamma(n_xm + 1);
            }

            return partial_sum + digamma_sum;
        },
    0) / x_points.length;

    return Math.max(0, digamma(k) + (m - 1) * digamma(n_samples) - mean_psi_nxm);
}
