+++
draft = true
title = "Composition and Subspaces"
date = "2024-09-12T13:26:15+12:00"
author = ""
authorTwitter = "" #do not include @
cover = ""
tags = ["", ""]
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = false
hideComments = false
color = "" #color from the theme settings
+++

<script src="https://cdn.plot.ly/plotly-2.32.0.min.js" charset="utf-8"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
<script src="config.js"></script>
<script src="charts.js"></script>
<script src="observer.js"></script>

In this post, we will explore how, and why, to 
project from a high-dimensional space to a low-dimensional space and back.

For the first section, we will play with some simple models intended to build an intuition
for what is and isn't possible with these projections. We'll also build some techniques 
for analysing these *subspaces*, and comparing different *subspaces*.

In the second section, we will dive into how, and why, we can apply this to machine learning,
and in particular to the transformer architecture. For this section, I'd recommend reading 
[A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html).
In particular, understanding the transformer architecture, and the idea of **composition** between
heads.

I was inspired to write this post after reading *A Mathematical Framework* and wondering if 
there was a way to get a more granular understanding of attention head composition. Beyond just 
asking if heads composed, I wanted to try quantify the effective "bandwidth" between two heads. This
post summarizes that work, which was somewhat successful. 


# Part 1: Geometry and Intuition

To understand communication between attention heads, we need to understand projection.
We will start out with low-dimensional examples, which we can visualize, to help build our intuition. 
A lot of this will carry over to higher dimensions, which we cannot fully visualize.

## A simple projection (2D -> 1D)

To explain what we mean by projection, imagine we have a 2D space.

We'll call a vector living in this space \(\vec{x}\), and it will look like:

\[
    \begin{align}
        \vec{x} = \begin{bmatrix} 
                x_0 \\
                x_1 \\
                  \end{bmatrix}
    \end{align}
\]

Here, \(x_0\) and \(x_1\) are just numbers. E.g. an element of our 2D space could be:

\[
    \begin{align}
        \vec{x} = \begin{bmatrix}
                    5.2   \\
                    -11.0 \\
                  \end{bmatrix}
    \end{align}
\]

We can define a matrix, \(W_{(2\rightarrow 1)}\), to project vectors from our 2D space into a new 1D space. 
We'll call elements of this new 1D space \(\vec{y}\), and they will look like:

\[
    \begin{align}
        \vec{y} = \begin{bmatrix}
                    y_0 \\
                  \end{bmatrix}
    \end{align}
\]

All our projections will be linear, meaning \(W_{(2 \rightarrow 1)}\) will not depend on the 
values of \(\vec{x}\)

To make things a little less abstract, lets pick some values for \(W_{(2 \rightarrow 1)}\). 
Any numbers will do, and these are picked somewhat arbitrarily.

\(W_{(2 \rightarrow 1)}\) will be a *1 x 2* matrix: 
2 columns for the number going in, 1 row for the number coming out.

\[
        \begin{align}
            W_{(2 \rightarrow 1)} = \begin{bmatrix}
                                    2 & -1 \\
                                  \end{bmatrix}
        \end{align}
\]

Our 1-dimensional vector \(\vec{y}\) is then simply:

\[
                            \vec{y} = W_{(2 \rightarrow 1)} \: \vec{x}
\]
                        

#### Projecting Down

Let's throw a bunch of points in our 2D space, wiggling around randomly.
We'll then project them to our 1D space, and visualize what happens.

<div id="plot1"></div>

<script>
spawn_plot("plot1", d2_d1);
</script>


[[[
    Plot: 2D plot with wiggling points, 1D plot with wiggling points.

    \(W_{(2 \rightarrow 1)}\) modifiable.

    Orient to line button.
]]]

A few notes: 
- The straight line in the 2D plot represents our matrix, \(W_{(2 \rightarrow 1)}\).
- Change the values of \(W_{(2 \rightarrow 1)}\) and seeing how the line changes.
- Try clicking the "orient along line" button, and then imagine collapsing the vertical
  direction in the plot. You should see that this is equivalent (minus a scaling factor)
  to the 1D plot.

Hopefully, I have convinced you that the following concepts are all equivalent:
- Projecting a 2D point along a line.
- Multiplying a *1 x 2* matrix with a 2D vector
- Taking a weighted sum of components in 2D, i.e. \(y_0 = a \cdot x_0 + b \cdot x_1\)

Finally, you should see that by doing this projection, we have fundamentally 
**lost information**. If this fact isn't obvious yet, that's ok - it'll become clear when
we project back up.

#### Projecting Up

We've seen that projecting down loses information, by collapsing our plane onto a line.
Does projecting up similarly expand a line into a plane? 

No, it doesn't.

In fact, we'll see that projecting a 1D vector to higher dimensions simply means writing
to a line in that high-dimensional space. Since we're using constant matrices, that line
is always going to be straight. Hence, even though our up-projected vector *looks* 2-dimensional,
in some very real sense it is still squarely 1D.

To show this, let's define our up-projection matrix, \(W_{(1\rightarrow2)}\). 
This will need to be of shape *2 x 1*: 1 column for the dimension going in, 2 rows
for the dimensions coming out. Again, the numbers in this matrix were picked arbitrarily.

\[
\begin{align}
        W_{(1 \rightarrow 2)} = \begin{bmatrix}
                                -1.5 \\
                                3.2 \\
                                \end{bmatrix}
\end{align}
\]

We'll continue calling our 1D vector \(\vec{y}\), and call the up-projection \(\vec{z}\).

Then, we have:

\[
                        \vec{z} = W_{(1 \rightarrow 2)} \: \vec{y}
\]

Once again, play around with the values of \(W_{(1 \rightarrow 2)}\) and prove to yourself 
that up-projecting is **always** going to write along a line in the higher-dimensional space.

<div id="plot2"></div>
<script>
spawn_plot("plot2", d1_d2);
</script>

It turns out that this fact generalizes into higher dimensions.

If we want to, we can combine a down-projection with an up-projection. 

That is, 

\[
\begin{align}
                        \vec{z} &= W_{(1 \rightarrow 2)} \: \vec{y} \\
                        \vec{z} &= W_{(1 \rightarrow 2)} \: (W_{(2 \rightarrow 1)} \: \vec{x}) \\
                        \vec{z} &= (W_{(1 \rightarrow 2)} \: W_{(2 \rightarrow 1)}) \: \vec{x} \\
                        \vec{z} &= W_{(2 \rightarrow 1 \rightarrow 2)} \: \vec{x}
\end{align}
\]

Where \(W_{(2 \rightarrow 1 \rightarrow 2)}\) is a new matrix, of size *2 x 2*, created by multiplying
the existing up-projection and down-projection matrices together.

Because our matrix squeezes our 2D space through a 1D **bottleneck**, 
it will have a **[rank](https://en.wikipedia.org/wiki/Rank_(linear_algebra)) of 1**, despite being *2 x 2*.

This is exactly equivalent to saying our matrix projects our higher dimensional space along a line,
scales it by some amount, and then projects it out along another line.

Hopefully by now you can guess what this combined matrix is doing:

1. Squeeze 2D space into a 1D projection along a line.
2. Write the 1D projection into a line in 2D space.

Note that up-projecting doesn't "unsqueeze" the 1D data - that has been irreversibly squashed,
and information has been lost.

<div id="plot3"></div>
<script>
spawn_plot("plot3", d2_d2);
</script>


## Aside: Polarization

Even with the very simple tools we've developed, we can have some fun! 

In some sense, a low-rank matrix *filters* or *polarizes* the space it reads in along a particular
direction. With very few assumptions, we can recreate a surprising fact from quantum mechanics!

First, let's make a down-projection matrix \(W_{down}\). 
We'll fix the matrix elements to lie along the unit circle, with angle \(\theta\). This is the same as saying
we won't rescale our projection along the line.

That is,

\[
\begin{align}
                W_{down} = \begin{bmatrix}
                        \cos{\theta} & \sin{\theta}
                            \end{bmatrix}
\end{align}
\] 

Here \(\theta\) gives us the angle of our line from the \(x_0\) direction.

Next, we just assume that our up-projection matrix \(W_{up}\) writes in the direction of the
same line that we just read from.

\[
\begin{align} 
                W_{up} = \begin{bmatrix}
                        \cos{\theta} \\
                        \sin{\theta} \\
                        \end{bmatrix} 
\end{align}
\]

Our combined matrix \(W = W_{up} \: W_{down}\) is therefore:

\[
\begin{align}
               W_{\theta} = \begin{bmatrix}
                    \cos^2{\theta} & \cos{\theta}\sin{\theta} \\
                    \cos{\theta}\sin{\theta} & \sin^2{\theta} \\
                   \end{bmatrix}
\end{align}
\]

It turns out this is **exactly** the [Jones matrix](https://en.wikipedia.org/wiki/Jones_calculus) for
the polarization of light! We can see it in action below:

<script>
let p_angle1 = 1.52; // rad
function get_jones_matrix(theta) {
    let s = Math.sin(theta);
    let c = Math.cos(theta);
    return [s, c];   
}
let mat = get_jones_matrix(p_angle1);
</script>

<div id="polarization">
    <div id="pz_plot"></div>
    <input type="range" min="0" max="6.283" value="1.52" class="slider" id="p_angle1",
     oninput="p_angle1 = this.value; 
              mat = get_jones_matrix(p_angle1);
              "
</div>
<script>
spawn_plot(d2_d2("pz_plot", mat, mat));
</script>

[[
    Interactive, 2D -> 2D, with theta adjustable
]]

In many ways, this is the simplest bottleneck projection we could do - it reads and writes along 
the same direction, it doesn't rescale - and yet it already has some pretty wild emergent properties!

Take the [Three-Polarizer Paradox](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Quantum_Tutorials_(Rioux)/07%3A_Quantum_Optics/7.13%3A_The_Three-Polarizer_Paradox): 

Let's place two polarizers, at angles 90° from one another - e.g. 0°, 90°. 

The first polarizer cancels out any vertical component, leaving only horizontally polarized waves. 
The second cancels out the horizontal component, leaving... nothing. 
In real life, if we take two polarizing filters and place them 90° to 
each other, we do in fact block all of the light.

We can see this in the maths:

\[
\begin{align}
            W_{0°} &= \begin{bmatrix}
                        1 & 0 \\
                        0 & 0 \\
                        \end{bmatrix} \\
            W_{90°} &= \begin{bmatrix}
                        0 & 0 \\
                        0 & 1 \\
                        \end{bmatrix} \\
            W_{90°} \: W_{0°} &= \begin{bmatrix}
                                        0 & 0 \\
                                        0 & 0 \\
                                \end{bmatrix}
\end{align}
\]

However, lets try adding a 45° polarizer between the 0° and 90°:

\[
\begin{align}
            W_{45°} &= \begin{bmatrix}
                        0.5 & 0.5 \\
                        0.5 & 0.5 \\
                      \end{bmatrix} \\
                        \\
                      \\
            W_{90°} W_{45°} W_{0°} &= \begin{bmatrix}
                       0 & 0 \\
                       0.5 & 0 \\
                       \end{bmatrix}
\end{align}
\]
                        
**Light passes through!**

If you can find 3 pairs of polarized sunglasses, I'd highly recommend trying this for yourself.

It can be fun to think of low-rank matrices as an abstract kind of polarizer. The difference,
of course, is that most of the time we're not writing out to the same exact space we read in from.

(Remember, saying a matrix is low-rank is exactly the same as saying we 
map down to a bottleneck layer of lower dimension, and then map back up.)

## Symmetry

You might've noticed that when we combine an up-projection matrix and a down-projection
matrix (e.g. \(W_{\theta}\) in the polarization example), the hidden layer effectively
disappears. We didn't **need** to explicitly write out the intermediate value of \(\vec{y}\),
like so:

\[
\begin{align}
            \vec{z} &= W_{up} \: \vec{y} \\
            \vec{y} &= W_{down} \: \vec{x}
\end{align}
\]

Because nothing in the equations depends on the value of \vec{y},
we are free to fold it into the matrices. In some sense, the matrix
\(W_{up}\:W_{down}\) is more unique than the two sub-matrices individually.

We have a lot of freedom in how we slice and dice the combined matrix \(W_{ud} = W_{up}\:W_{down}\)
into two rectangular matrices. 

Algebraically, 

\[
\begin{align}
    W_{ud} &= W_{up}\:W_{down} \\
           &= W_{up}\:A\;A^{-1}\:W_{down} \\ 
\end{align}
\]

Where \(A\) is any invertible matrix of shape \(d_{bottleneck} \times d_{bottleneck}\).

In this formulation, we would fold \(A\) into \(W_{up}\) and \(A^{-1}\) into \(W_{down}\), 
and in doing so arbitrarily linearly transforming \(\vec{y}\):

\[
\begin{align}
    \vec{z} &= (W_{up}\:A) \vec{y} \\
    \vec{y}&= (A^{-1}\:W_{down}) \vec{x} \\
\end{align}
\]

In some sense, we can say \(\vec{y}\) has a pretty extensive set of *symmetries*, whereby we can
arbitrarily rotate, scale, etc. the definition of \(\vec{y}\), without ever changing the overall
action performed by \(W_{ud}\). In my mind's eye, I imagine \(W_{ud}\) as a cube, and \(\vec{y}\) as
slicing that cube in half about some arbitrary axis. Regardless of how the first half of the cube is 
sliced, the second half exactly cancels out that slice.

Most of these symmetries will be quite boring. 

In a machine learning context, for example,
we should expect matrices of this type (e.g. the OV-circuit in a transformer) to represent a
randomly picked orientation in this huge group of symmetries. Because the model doesn't use \(\vec{y}\)
for anything, we should expect the \(\vec{y}\) we find in a real model to be randomly oriented. The 
symmetries here mean no direction is special, and we shouldn't expect to find a privileged basis.

#### Symmetry in QK circuits

A QK circuit is responsible for computing the [attention pattern](https://transformerlensorg.github.io/CircuitsVis/?path=/docs/attention-attentionpattern--induction-head)
of the attention head, and
involves down-projecting the residual stream through two different matrices \(W_Q\) and \(W_K\),
before taking the dot product of these two vectors. This gives us the attention score, which is 
then softmax'd to get the attention pattern.

Writing this out, the attention score \(s\) is:

\[
\begin{align}
                s &= \langle \vec{y_q}, \vec{y_k} \rangle \\
                  &= \langle W_K\:\vec{x}, W_Q\:\vec{x} \rangle \\
                  &= (W_K\:\vec{x})^T\:W_Q\:\vec{x} \\
                  &= \vec{x}^T\:W_K^T\:W_Q\:\vec{x} \\
\end{align}
\]

If we want to perform a basis in the bottleneck dimension, 
and we add the restriction that we want to multiply both \(W_Q\) and \(W_K\) by the same
matrix \(A\), we get the following:

\[
\begin{align}
                s &= (A\:W_K\:\vec{x})^T\:A\:W_Q\:\vec{x} \\
                  &= \vec{x}^T\:W_K^T\:A^T\:A\:W_Q\:\vec{x} \\
   \therefore A^T &= A^{-1}
\end{align}
\]

The matrices \(A\) that match this requirement are all part of the [Orthogonal Group](https://en.wikipedia.org/wiki/Orthogonal_group)
\(O(n)\). For example, if our bottleneck layer was 3-dimensional, we could use any matrix in \(O(3)\) to find 
another basis. \(O(n)\) can be thought of as all possible flips, rotations, etc. we could perform in 
n-dimensions. By definition, it preserves the inner product (in our case, the dot product), which
explains why we can use it for the attention score.


### Symmetries in Symmetries

Part of what makes neural nets like transformers so hard to interpret is that big components, like
the [residual stream](https://transformer-circuits.pub/2021/framework/index.html#residual-comms), 
exhibit these symmetries. As explained in **A Mathematical Framework**, the residual stream is 
just an arbitrary slice taken between the embedding and unembedding matrices. We could easily apply
a transformation to every matrix that reads from or writes to the residual stream, and the model
would be indistinguishable mathematically.

How then can we make any meaningful claims about different components which communicate through
the residual stream?


## Communication 

This is where everything we've learned so far comes together. We'll start with a toy model - 
two 1-dimensional hidden layers communicating via a 2-dimensional channel - and build from there.




