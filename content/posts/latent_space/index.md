+++
title = "Navigating Hyperspace"
date = 2024-07-25T12:19:22+12:00
image = "routeburn.jpg"
cover = "routeburn.jpg"
+++
<script src="./plotly-2.32.0.min.js?{{ .Now.Unix }}" charset="utf-8"></script>
<script src="math_lib.js?{{ .Now.Unix }}"></script>
<script src="charts.js?{{ .Now.Unix }}"></script>
<script src="vector_math.js?{{ .Now.Unix }}"></script>


# Why explore hyperspace?

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
    \vec{v} = \begin{bmatrix}
        1.9 \\
        4.7 \\
        -3.1 \\
    \end{bmatrix}
\end{align}
\]

An n-dimensional vector is \(n\) items long:

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
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
    \vec{v} = \begin{bmatrix}
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
    \vec{v} = \begin{bmatrix}
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
    \vec{v} = \begin{bmatrix}
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
    \vec{v} = \begin{bmatrix}
        0.93 \\
        -0.43 \\
        0.67 \\
            0.12 \\
    \end{bmatrix}
\end{align}
\]

We could *try* using time as an extra dimension,
but we've already run out of spatial dimensions. 

Of course, we want to go far beyond a mere *four* dimensions. 
How would we visualize something like this?

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        x_{1} \\
        x_{2}\\
        \vdots \\
        x_{1000} \\
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
        0.21 \\
        -0.85 \\
        -0.32 \\
    \end{bmatrix}
\end{align}
\]

We can display the first 2 elements, i.e.:

\[
\begin{align}
    \vec{v} = \begin{bmatrix}
        0.21 \\
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
elements, such as the last element \(\vec{v}_{3}\)
and the second element \(\vec{v}_{2}\):

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

If we're plotting, say, \(\vec{v_{1}}\) and \(\vec{v_{2}}\),
we get a perfect understanding of how our points are
distributed in those two dimensions. 

Should we want to know
what portion of points have \(\vec{v_{1}}\) > 0
and \(\vec{v_{2}}\) < 0, for example, we can
look at the 2D chart and easily see the answer is
~25%.

However, we get absolutely no information about the
rest of our vector. It wouldn't matter if we were
plotting a vector of length 3 or a vector of length 
3000 - from this viewpoint, they all look the same.

## Different Projections

Without completely justifying it, I'm going to introduce
a completely different projection 
