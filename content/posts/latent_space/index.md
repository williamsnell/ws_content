+++
title = "Navigating Hyperspace"
date = 2024-07-25T12:19:22+12:00
image = "routeburn.jpg"
cover = "routeburn.jpg"
+++
<script src="./plotly-2.32.0.min.js" charset="utf-8"></script>
<script src="math_lib.js"></script>
<script src="charts.js"></script>
<script src="vector_math.js"></script>
<script src="interp.js"></script>


# Why explore hyperspace?

Hyperspace can be quite a cool topic, but it can also be intimidating. 
To give us a mission, let's start by posing a seemingly unrelated
question:

If I want to smoothly blend from this image to this image, how should
I do so?

All the plots on this page are interactive!

- latent space is an important concept in AI
- we almost never stick to just 3 dimensions, and operate in n-dimensional space,
  or 'hyperspaces', where n can be 100, 1000, or bigger
- understanding the topology of such spaces can seem intidimidating, 
 but I think I can make it fun


# Windows into Hyperspace

Let's start with the concept of vectors. 

A vector is just a collection of numbers,
arranged in a single column or row, like so:

\[
\begin{align}
    \vec{v}_{3} = \begin{bmatrix}
        1.9 \\
        4.7 \\
        -3.1 \\
    \end{bmatrix}
\end{align}
\]

An n-dimensional vector is \(n\) items long:

\[
\begin{align}
    \vec{v}_{n} = \begin{bmatrix}
        x_{1} \\
        \vdots \\
        x_{n}
    \end{bmatrix}
\end{align}
\]

Vectors can be used to represent all sorts of things, but here we're
going to represent them as *coordinates*.

## 1-space

If we had only 1 spatial dimension to play with, we could represent every 
possible position with a 1-dimensional vector:

\[
\begin{align}
    \vec{v}_{1} = \begin{bmatrix}
        x_{1} \\
    \end{bmatrix}
\end{align}
\]

If we were to fill our space with lots of random points, uniformly 
distributed from -1 to 1, it would look like this: 


<div id="1d_space_chart" class="plotly"></div>

<script>
const vec_space = rand(1000, 1);
get_2d_chart(vec_space, "1d_space_chart", 0, ["", "", ""]);
</script>


Hopefully, this result is pretty unsurprising. 


## 2-space
If we extend our vectors into two dimensions, and perform the same exercise, we'll get
something like this: 

<div id="2d_space_chart" class="plotly"></div>

<script>
const vec_space_2 = rand(1_000, 2);
get_2d_chart(vec_space_2, "2d_space_chart", 0, ["", "", ""]);
</script>

For every possible location in this space, we can
define an exact point through something like:

\[
\begin{align}
    \vec{v}_{2} = \begin{bmatrix}
        -0.85 \\
        0.24 \\
    \end{bmatrix}
\end{align}
\]

## 3-space
Extending up to 3D is quite straightforward, where we 
now have 3-long vectors like this:

<div id="3_vec">
\[
\begin{align}
    \vec{v}_{3} = \begin{bmatrix}
        0.26 \\
        -0.88 \\
        -0.9 \\
    \end{bmatrix}
\end{align}
\]
</div>

Let's again scatter some points uniformly between -1 and 1, 
this time in 3 dimensions:

<div id="3d_space_chart" style="width: 100%;"></div>

<script>
const vec_space_3 = rand(10_000, 3);
get_3d_chart(vec_space_3, "3d_space_chart", 0, ["", "", ""]);
latexize_vector(vec_space_3[0], "3_vec");
</script>

We're very used to looking at 3D space through something like this, where 
our brain can reconstruct a series of 2D images into a 3D representation:

## Flattening Space

What if we wanted to look at this vector
inside its vector space:

\[
\begin{align}
    \vec{v}_{4} = \begin{bmatrix}
        0.93  \\
        -0.43 \\
        0.67  \\
        0.12  \\
    \end{bmatrix}
\end{align}
\]

We could *try* using time as an extra dimension,
but we've already run out of spatial dimensions. 

Of course, we want to go far beyond a mere *four* dimensions. 
How would we visualize something like this?

\[
\begin{align}
    \vec{v}_{1000} = \begin{bmatrix}
        x_{1}      \\
        x_{2}      \\
        \vdots     \\
        x_{1000}   \\
    \end{bmatrix}
\end{align}
\]

## Projecting 

To glimpse higher dimensions, we're
necessarily going to need to make compromises. 
With *up to* 3 dimensions to play with, any given 
viewport will need to choose what information to show and what to hide. 

A natural way to project higher dimensions is to just take
the first \(n\) we can display, and ignore the rest.

We can visualize what this looks like by creating a vector space
in three dimensions, and visualizing it with two. 

If we want to display the vector:

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        0.21   \\
        -0.85  \\
        -0.32  \\
    \end{bmatrix}
\end{align}
\]

We can display the first 2 elements, i.e.:

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        0.21  \\
        -0.85 \\
    \end{bmatrix}
\end{align}
\]

Visualized, it looks like so:

<div id="3d_into_2d" style="width: 100%;"></div>

<script>
get_2d_3d_chart(vec_space_3, "3d_into_2d");
</script>

We can pick any 2 elements to display, of course. 
Representing our 3-space in 2 dimensions could 
be done equally validly by picking two different
elements, such as the last element \(x_{3}\)
and the second element \(x_{2}\):

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        -0.32 \\
        -0.85 \\
    \end{bmatrix}
\end{align}
\]

What does our 2D projection tell us about the 3D space?
Well, we effectively get the same view as if we rotated 
our 3D view until we were just looking at one face. 

If we're plotting, say, \(x_{1}\) and \(x_{2}\),
we get a perfect understanding of how our points are
distributed in those two dimensions. 

Should we want to know
what portion of points have \(x_{1}\) > 0
and \(x_{2}\) < 0, we can
look at the 2D chart and easily see the answer is
~25%.

However, we get absolutely no information about the
rest of our vector. It wouldn't matter if we were
plotting a vector of length 3 or a vector of length 
3000 - from this viewpoint, they all look the same.

## Different Projections

So far, we've been exploring space with *cartesian* coordinates.

Without completely justifying it, I'm going to introduce
a completely different coordinate system - [spherical coordinates](https://en.wikipedia.org/wiki/Spherical_coordinate_system).

In a spherical coordinate system, a point in space is defined
not by \(n\) orthogonal coordinates (e.g. x, y, and z), but rather 
as a *radial distance* \(r\), and then a series of angles
\(\theta_1\), \(\theta_2\), etc. like so:

\[
\begin{align}
    \vec{s}_n = \begin{bmatrix}
        r          \\
        \theta_{1} \\
        \vdots     \\
        \theta_{n} \\
    \end{bmatrix}
\end{align}
\]



Essentially, we have a line of some length \(r\), starting at the
origin, which we then reorient along our angles \(\vec{\theta}\).
The tip of the line represents the point in space we are describing.

In 3-space, these two vectors represent the same position:

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        0.54  \\
        -0.87 \\
        0.26  \\
    \end{bmatrix}_{[x,y,z]}
    = \vec{s} = \begin{bmatrix}
        1.06  \\
        -1.02 \\
        1.32  \\
    \end{bmatrix}_{[r, \theta_1, \theta_2]}
\end{align}
\]

Where I've used the letter \(\vec{s}\) to denote a 
vector in spherical coordinates.

### Why bother with spherical coordinates?
How does this help us? After all, you still
need an n-length vector to represent a point in n-space.

What's interesting, however, is when you start looking at 
higher dimensions. Since the length \(r\) takes into account
the entire vector, plotting the first 2 or 3 elements in the 
spherical vector gives us a different view on higher dimensions.

Importantly, we always keep the magnitude of the full vector.
We then get to select 1 angle (for a 2D plot) or 2 angles (for 
a 3D plot). These angles represent the relative positioning
between two elements of the vector.


Below, you can increase the dimensionality of the space being
visualized. **Before you do**, make a guess about what you think
will happen as the number of dimensions increases.

<div id="spherical" style="width: 100%;"></div>
<div id="spherical_vec"></div>
<div id="tooltip-1space" style="display: none;">
    // 1-space

1-space is boring as ever... 

Jump to the next space with the "Dimensions (+)" button.
</div>
<div id="tooltip-2space" style="display: none;">
// 2-space

In 2-space, both the 2D and the 3D plot display the same 
thing. This is also the exact same view we would get if we were
using cartesian coordinates. Because any 2-length vector losslessly
describes this space, we can freely switch between them without issue.
</div>
<div id="tooltip-3space" style="display: none;">
// 3-space

3-space is where it gets interesting. Our **3D plot** still holds enough
dimensionality to perfectly represent our vector, and so our view is
identical to the cartesian plot we had earlier. 

The **2D plot**, however, is different. Even though our points are randomly
distributed between -1 and 1, we are starting to see points shift outside
that range.

Remember that the distance from the origin (0, 0) in our 2D plot now
represents the absolute distance from the origin in n-space. 

Looking at the 3D view of the cube, which points do you think
have a distance to 
the origin (a *vector magnitude*) greater than 1?

Interestingly, a hole has started to appear in the centre of the plot. 

Why do you think this is? 

What might you expect to see happen as we continue to increase the dimensionality
of our space?
</div>
<div id="tooltip-4space" style="display: none;">
// 4-space

This is the first space that cannot be fully represented by the
spatial dimensions we have at hand. If you've been watching the 2D 
plot over the last few dimensionalities, you should be able to guess
what's coming for our 3-space plot.

This is also the first dimensionality where we get multiple 3D and 2D 
plots to hop between. By pressing the "Elements (-)" or "Elements (+)"
buttons, we can move through the vector, choosing different elements
to act as the "direction" component of our spherical projection.
</div>

<div id="tooltip-5space" style="display: none;">
// 5-space and beyond

I'll leave you be as you explore the next few dimensions.

Have a play around, and try and build an intuition for 
what these charts are telling you about the spaces.
</div>


<script>
let dims_with_text = [1, 2, 3, 4, 5];
const vec_space_1000 = rand(10000, 1000);
let redraw_spherical = get_projected_chart(vec_space_1000, 'spherical', ["", "", ""], vecs_to_spherical);
let callback = (dimensions, slice_offset) => {
    for (let dim of dims_with_text) {
        if (dim == dimensions) {
            document.getElementById(`tooltip-${dimensions}space`).style.display = "block";
        }
        else {
            document.getElementById(`tooltip-${dim}space`).style.display = "none";
        }
    }
    redraw_spherical(dimensions, slice_offset);
}
let widget = get_vector_widget(vec_space_1000[0], 'spherical_vec', callback);
</script>


# Tracing Lines Through Hyperspace

<div id="spherical_lerp"></div>
<div id="lerp_vec"></div>
<script>
let redraw_chart = get_interpolated_chart(vec_space_1000, "spherical_lerp", lerp, vec_space_1000[0], vec_space_1000[1],
                                          vecs_to_spherical);
let widget2 = get_vector_widget(vec_space_1000[0], "lerp_vec", redraw_chart, 1);
</script>
