+++
title = "Why Is Measuring Composition So Difficult?"
date = "2024-10-12T19:57:00+13:00"
author = "Will Snell"
cover = "DSC_0621.jpg"
tags = ["", ""]
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = false
hideComments = false
color = "" #color from the theme settings
+++
> This post was inspired by, and heavily leans upon, the structure set out in 
["A Mathematical Framework for Transformer Circuits."](https://transformer-circuits.pub/2021/framework/index.html)
In it, the authors present
a compelling way to decompose the transformer architecture into individual, 
more interpretable pieces. \
\
If you haven't read it yet, I'd recommend doing so. Most of what I present
won't make sense without context.

# Motivation

A transformer's ability to process long sequences of text is 
facilitated by multiple attention layers, which we can decompose into
multiple attention *heads* per layer.

Because all information moving between tokens in a sequence must pass through an attention head, 
tracing how they are wired together should give us a circuit diagram of where a good chunk of 
the internal information is moving, and might let us 
decompose the monolithic transformer into many smaller, interconnected pieces.

While MLPs can and do move information, attention heads can *only* move and scale information, 
and do so in an almost linear way.

We have a strong motivation to want to analyse a model by direct inspection of its weights,
rather than by actually using the model for inference. Firstly, running models can be computationally expensive, while
inspecting weights is typically quite cheap.
Secondly, if we have to run the model, we need data for it to process. If we want to make 
strong conclusions about our observations, we need a breadth and depth of data, and often
we need to curate the data appropriately. Direct inspection of weights bypasses all of that - the 
numbers that make up the model are unchanging (once trained) and easily accessible.

If we can treat attention head information movement as linear, we gain access to a host of linear
algebra tools to analyse the system. The promise of this approach is a large and reasonably comprehensive circuit diagram,
purely by inspecting the values of the models' various weight matrices.

I am not the first to try and measure composition this way. In 
[A Mathematical Framework](https://transformer-circuits.pub/2021/framework/index.html),
the authors use the Frobenius norm to measure how much two heads compose with one another.

In [Thoughts on Formalizing Composition](https://www.lesswrong.com/posts/vaHxk9jSfmGbzvztT/thoughts-on-formalizing-composition),
Lieberum takes this further, axiomatizing what it means to measure composition. These axioms can
be summarized (imprecisely) as follows:

### Lieberum's Axioms

Let's imagine two matrices \(A\) and \(B\), defined as \[B \in \mathbb{R}^{m \times n}, \;A \in \mathbb{R}^{n \times m}\] 

\(A\) is the matrix in an early head that **writes to** the residual stream.

\(B\) is the matrix in a later head that **reads from** the residual stream.

Let's define a score as \[C(A,B)\]

\(C \) takes the two matrices and outputs some kind of a score.

#### Axiom 1: 

If \(C(A,B) = 1\) - that is, two heads are composing as much as possible - \(A\) should only
write where \(B\) can read.

#### Axiom 2:

If \(C(A,B) = 0\) - the two heads are not composing at all - \(B\) cannot read anything that
\(A\) writes.


#### Axiom 3:

\(C\) should vary 'smoothly' and 'monotonically' in some sense, i.e. if there is more overlap, then \(C\)
should be larger, and vice versa.



Axiom 3 is fairly complicated, and really says 2 different things:

1. \(C\) should be smooth: We cannot just count the number of overlapping dimensions
    between our writing and reading heads. Instead, there now exists a grey area where
    a writing dimension partially overlaps a reading dimension, and our metric must account
    for this. In some sense, we can describe this as how much the reading head is "focused"
    on the writing head, versus just randomly reading in some of its outputs as background noise.
2. \(C\) should be monotonic: More overlap should lead to a higher \(C\) score.

We can extend this definition to make it more rigorous, in the spirit of what Axiom 3 was trying
to convey. We will then show that, assuming communication in the residual stream is linear (i.e. ignoring input norm and MLPs),
none of the current methods for analysing composition meet axioms 3 and 4.

#### (Proposed) Axiom 4:
\(C\) should measure the underlying information flow, and thus the relative ordering of composition scores between
pairs of heads should be preserved when the model is changed in a way that does not affect information flow.


If \(C(A, B) > C(A, D)\), then this ordering should be preserved for an equivalent transformer separated only by a basis
transformation which leaves the information flow through the model unchanged. That is, 
\[
\begin{align}
C(A^*, B^*) > C(A^*, D^*) &\iff C(A, B) > C(A, D) \\
\\
    \text{Where } A^* &= T\:A \\
    B^* &= T^{-1}\:B \\
    D^* &= T^{-1}\:D \\
\end{align}
\]

Where \(T\) is an invertible matrix which exploits a symmetry of the model to leave information flow unchanged. 

A concrete example of \(T\) which will effectively always work is 

\[
T = \begin{bmatrix}
        0& 1& ... &0\\
        1& 0& ... &0\\
        \vdots & \vdots & \vdots & \vdots\\
        0 &... &...  & 1\\
\end{bmatrix}
\]

That is, we simply swap the order of the first and second residual stream directions, and leave everything
else unchanged. Heads which previously wrote to direction 1 will now write to direction 2, and vice versa.
A head which previously read from direction 1 will now read from direction 2, etc. The actual information 
flow has not changed, and we have effectively just relabelled the axes.

All our typical tools for measuring composition easily survive this relabelling, and so they should! 
We will see through the remainder of this post that there are subtler manipulations we can use which
pose actual problems if we hope to meet axioms 3 and 4.

# Linear Analysis

Following the work in [[1]](https://transformer-circuits.pub/2021/framework/index.html) and 
[[2]](https://www.lesswrong.com/posts/vaHxk9jSfmGbzvztT/thoughts-on-formalizing-composition),
we will begin by ignoring MLP layers and layer normalization. We know that both of these
non-linearities can contribute to information movement, and hence composition. Later on, 
we'll touch on layer normalization.

For now, removing them gives us purely linear communication from component to component
in the residual stream.

## The unavoidable symmetries of the residual stream.

#### Symmetries *Inside* Heads
"A Mathematical Framework" points out that the specific
vector we get when looking inside a transformer head is not 
particularly meaningful. We'll work through the OV-circuit 
to show why this is the case.

Denoting the residual stream read a head can read from as \(\vec{x}_0\), the residual stream the same
head writes to as \(\vec{x}_1\), and 
the hidden layer inside the head itself as \(\vec{y}\), the OV circuit is implemented as:

\[
\begin{align}
    \vec{x}_1 &= W_O\:\vec{y} \\
    \vec{y}   &= W_V\:\vec{x}_0
\end{align}
\]

We can make \(\vec{y}\) disappear by combining the O and V matrices, without any
loss of generality:

\[
\begin{align}
    \vec{x}_1 &= (W_O W_V) \vec{x}_0 \\
              &= W_{OV} \vec{x}_0 \\
\end{align}
\]

It's common to think of the combination of the \(W_O\) and \(W_V\) matrices
as a single low-rank matrix \(W_{OV}\), exactly because we have so many 
different ways to slice up \(W_O\) and \(W_V\), all of which are valid.

To be precise, for any invertible matrix of appropriate shape \(T\):

\[
\begin{align}
    \vec{x}_1 &= W_O\:(T\:T^{-1})\:\vec{y} \\
              &= (W_O\:T)(T^{-1}\:W_V)\:\vec{x}_0 \\
              &= (W_O^*)(W_V^*)\:\vec{x}_0 \\
    \vec{y}^* &= W_V^*\:\vec{x}_0
\end{align}
\]

We can pick the basis of \(\vec{y}^*\) by any (invertible) transformation.
The dimensionality of \(\vec{y}^*\) cannot be changed (because then \(T\) wouldn't be invertible),
but otherwise we are free to do whatever we want.

More than that, we should **expect** any applicable \(T\) to have **already been applied** by the time 
we are handed our model to analyse. 

Our model and any techniques we apply must respect
that \(\vec{y}\) is **symmetric** with respect to the 
[group \[\text{GL}_n(\mathbb{R})\]](https://en.wikipedia.org/wiki/General_linear_group)

In other words, there are an infinite collection of \(W_O\)'s, and for every one a partner \(W_V\).
However, there is only one unique \(W_{OV}\).

The same analysis can be applied to the matrix used to compute the dot-product attention, \(W_Q^T\:W_K\).

#### Symmetries *Between* Heads

If we're serious about ignoring LayerNorm (or its equivalent), we can extend this idea of symmetry 
outwards, to the residual stream (\(\vec{x}\)) itself. 


Looking at the first few layers, for a single attention head:

\[
\begin{align}
            \vec{x}_0 &= W_E \\
            \vec{x}_n &= \mathbb{A} \cdot W_O W_V \vec{x}_{n-1} \\
            \mathbb{A} &= f(\vec{x}_{n-1}^T W_Q^T W_K \vec{x}_{n-1}) \\
            \ell &= W_U \vec{x}_{n}
\end{align}
\]

Where \(W_E\) is the embedding matrix, \(\mathbb{A}\) is the attention pattern calculated 
between sequence positions, and \(\ell\) the log-probabilities.

We can multiply anything which writes to the residual stream by an invertible matrix \(T\),
and anything which reads from the residual stream
by its inverse \(T^{-1}\).
The following system is identical to the previous:

\[
\begin{align}
            T \vec{x}_0 &= T\: W_E \\
\\
            T \vec{x}_n &= \mathbb{A} \cdot T\;W_O W_V\;T^{-1}\;T\vec{x}_{n-1} \\ 
                        &= \mathbb{A} \cdot (T W_O W_V T^{-1})\;T\vec{x}_{n-1} \\ 
\\
            \mathbb{A} &= f((T \vec{x}_{n-1})^T (T^{-1})^T W_Q^T W_K T^{-1}\;T \vec{x}_{n-1}) \\
                       &= f((T \vec{x}_{n-1})^T (T^{-T} W_Q^T W_K T^{-1})\;T \vec{x}_{n-1}) \\
\\
            \ell &= W_U\;T^{-1}\;T\;\vec{x}_{n}\\
\end{align}
\]

In other words, there are an infinite family of symmetric models. These are, for all intents and 
purposes, **the same model**, but have completely different weights. 

Just as \(W_O\) and \(W_V\) were not unique in our previous example, the aggregate matrices
\(W_O W_V\) and \(W_Q^T W_K\) are symmetric, and can be arbitrarily modified by our choice of \(T\). 
The residual stream is symmetric about the group \(\text{GL}_n\), and (ignoring non-linearities), our 
analysis must respect that.

It's worth pointing out that \(W_{OV}\) and \(W_Q^T\:W_K\) transform differently.
\(W_{OV}\) transforms by \(T (.) T^{-1}\), while \(W_Q^T\:W_K\) transforms by \(T^{-T}\:(.)\:T^{-1}\).

The composite matrix \(W_{Q}^TW_K\:W_{OV}\) therefore transforms by \(T^{-T}\:(.)\:T^{-1}\).



#### Why does this matter?

\(\text{GL}_N(\mathbb{R})\) is a very extensive group. Not only does it contain the group
of all rotations and reflections \(\text{O}(n)\), but it allows us to arbitrarily scale
different directions of the residual stream, or shear different directions to bring them 
arbitrarily close together (but never parallel), or far apart. 

If we continue to work in this symmetric basis, we are left with very few linear algebra tools
to measure composition
that could not be confounded by an adversarial choice of \(T\). To enumerate:

- We can't rely on the angle between vectors (e.g. writing directions vs reading directions) 
  to be meaningful (unless they are exactly parallel or perpendicular), because a small angle could 
  just be the result of an adversarial \(T\) shearing directions to be close together.
- We can't rely on the ordering of singular values (or eigenvalues). A singular value could be large
  merely because an adversarial \(T\) scaled down the direction in the residual stream we
  are reading from, or scaled up the direction we are writing to.

#### A Way Out

Possible ways to get out of this symmetry are:

1. Observe the model during runtime, collecting statistics on the residual stream directions. 
   Use this data to rescale the residual stream to something more regular (assuming such a regularization
   exists).
2. Gather statistics of the weight matrices of the model, which exploit the fact
   that the same \(T\) and \(T^{-1}\) must be applied to all heads in the model at the same time,
   and use these to normalize our measures of composition.
2. Perform the measurements in a way that removes the symmetry.

Option 2 is actually fairly easy to do without leaving our linear world. This uses the same technique
that gave us the \(W_{OV}\) combined matrix, namely: climb out of the hidden layer where the symmetry exists.

Instead of analysing \(W_{OV}\) and \(W_{QK}\) within the residual stream, 
we analyse them in the token space. That is, when performing measurements,
instead of considering \(W_{OV}\) we consider

\[
        W_U W_O W_V W_E = W_U\:T^{-1}\:T\:W_O W_V\:T^{-1}\:T\:W_E \\
\]

and instead of \(W_Q^T\:W_K\), we look at

\[
        W_E^T W_Q^T W_K W_E = W_E^T\:(T\:T^{-1})^T W_Q^T\;W_K\:T^{-1}\:T\:W_E \\
\]

This is a lot more unwieldy, given we've gone from a ~1,000 dimensional space to 50,000+.
But, it does mean that all our linear analysis tools start working again.

Operating in the token space works because \(W_E\) only ever receives one-hot vectors,
and \(W_U\) must output into the token space for decoding, and so neither are symmetric 
(beyond global scaling, which can be easily ignored.)

# What about Normalization?

Our linear model is well and good, but real transformers have normalization between reading the residual stream
and feeding it into the Q, K, and V matrices. Adding normalization to our simplified transformer:

\[
\begin{align}
            \vec{x}_0 &= W_E \\
            \vec{x}_n &= \mathbb{A} \cdot W_O W_V\;\mathcal{G}(\vec{x}_{n-1}) \\
            \mathbb{A} &= f(\mathcal{G}(\vec{x}_{n-1})^T W_Q^T W_K\:\mathcal{G}(\vec{x}_{n-1})) \\
            \ell &= W_U\;\mathcal{G}(\vec{x}_{n})
\end{align}
\]

Where \(\mathcal{G}\) is a non-linear normalization function. 

For our purposes, we'll consider [RMS norm](https://arxiv.org/pdf/1910.07467), used 
in models like LLaMA and Gemma. This has the functional form:

\[
\begin{align}
            \mathcal{G}(\vec{x}) = \frac{\vec{x}}{\text{RMS}(\vec{x})} \\
            \\
            \text{where RMS}(\vec{x}) = \sqrt{ \frac{1}{n} \sum_{i=1}^{n} x_i^2} \\ 
\end{align}
\]


Importantly for us, although the residual stream is still symmetric with this transformation,
it is only symmetric with respect to a matrix \(R\) that preserves the relation:

\[
\begin{align}
            R^{-1}\:\mathcal{G}(R\:\vec{x}) &= \mathcal{G}(\vec{x})\\
            \therefore \mathcal{G}(R\:\vec{x}) &= R \mathcal{G}(\vec{x})\\
\end{align}
\]

\(\text{RMS}(\vec{x})\) is just \(\frac{1}{\sqrt{n}} \cdot \vert \vert \vec{x} \vert \vert_2\), and
so we can satisfy this relation with any matrix \(R\) that scales all distances from the origin by the 
same value, \(\alpha\). This gives us the group \(\mathcal{O}(n)\) in combination with any scalar \(\alpha\) applied
globally.

Because \(\mathcal{O}(n)\) comprises all the reflections and rotations about the origin, it preserves not only 
angles between vectors, but also the magnitude of singular values. In some sense, RMS norm leaves us only with
the most boring symmetries, implying **all** of our typical tools for measuring composition should be valid.

Also of note, our symmetry-breaking trick shouldn't be expected to work once we include normalization, because: 
\[
            W_U\:W_{OV}\:W_E \neq W_U\:W_{OV}\:\mathcal{G}(W_E)\\
\]


## Things Get Murkier

Real models use input normalizations, and so we should be able to conclude that the residual stream in a real 
model is unique, modulo a rotation, reflection, or global scaling. Hence, any metric which is 
invariant under these simple symmetries (the inner product, for one, or the relative sizes of singular values)
can be used to measure interactions in the residual stream.

**However**, things are unfortunately not so simple. There is no clear consensus on what normalization does
at inference time, nor on whether its impact is meaningful:

- [Heimersheim](https://arxiv.org/pdf/2409.13710) removed LayerNorm entirely from GPT-2. After fine-tuning,
  the resulting model performed almost as well as the original. 
- [Xu et. al](https://arxiv.org/pdf/1911.07013) find that LayerNorm provides most of its benefits by regularizing
    **gradients** during **backpropagation**. They trained and evaluated models with LayerNorm, without LayerNorm, and with DetachNorm,
    which behaves like LayerNorm but does not allow the gradients of the mean and variance terms to back-propagate.
    DetachNorm performs the worst of the three, suggesting LayerNorm's benefit does not originate from 
    its effect at inference time.
- [Brody, Alon, & Yahav](https://aclanthology.org/2023.findings-acl.895.pdf) argue the opposite - that LayerNorm
  is crucial to the ability of attention heads to learn and express certain functions easily. A major caveat is that
  they studied very small models (8-dimensional residual stream, with 2-dimensional hidden head layers). 
  
  As models grow in size, they suggest the benefits of LayerNorm become less useful.

If we really can ignore input normalizations and treat the residual stream as linear, then we are left with a
highly symmetric residual stream and need to use a technique that breaks the symmetry (such as working in token space.)
Actually removing the normalization functions with fine-tuning (as [Heimersheim did](https://arxiv.org/pdf/2409.13710))
is not ideal, because it requires considerable compute and leaves us analysing a different model than what we started with.

If input normalization *is* important to the expressivity and performance of a transformer, there still remains the question
of whether the residual stream is a meaningful-enough basis to analyse it in. As the dimensionality of the residual stream grows, 
the impact of
any one direction on the normalization statistics (such as variance) shrinks. It's not hard to imagine scaling up
or down residual stream directions, perhaps enough to reorder the singular values in a few attention heads, without
meaningfully changing the effect of input normalization. We are no longer talking about **identical** models related by
a perfect symmetry, and so our conclusions are not quite so strong. 

Nonetheless, if we work purely in the residual stream, 
there still appears room for inner-products between vectors, or singular values of matrices, to be nudged 
such that any score relying on these two metrics could be altered without meaningfully altering how the involved heads communicate
with one another.

In the formalism of axiom 4, it's hard to prove that two very similar (but not strictly identical) models will always
preserve \(C(A, B) > C(A, D) \therefore C(A^*, B^*) > C(A^*, D^*)\).

Finally, there's the (reasonably likely) case where input normalization isn't important, per se, but its effects
are baked into the pretrained transformers we'd like to analyse. [Heimersheim](https://arxiv.org/pdf/2409.13710)
shows that layer norm cannot just be turned off - further finetuning is required. So if we apply our linear
metrics to an unaltered model with layer norm, it's unclear if our linear metrics are meaningful.

# What's next?

I'm fairly convinced at this point that trying to measure composition directly in the residual stream, using
linear algebra tools, is not as straightforward as hoped.
That's not to say, however, that we have no avenues left to pursue. Three options
available are:

1. Analyse composition in the token basis. This lets us confidently work with angles between vectors,
   and with relative ordering of (if not the absolute value of) singular values. However, this requires
   once again ignoring the effects of input normalization, which I am not yet convinced is completely valid.
2. Find some way of normalizing the weight matrices, without resorting to actual model inference, in order
   to bolster the linear algebra tools enough that they pass axiom 4.
3. Use some kind of inference-time methods that pass data through the network to measure composition. This gives up 
   a lot of our linear algebra tools, but lets us actually characterise what non-linear parts of the system
   (the input normalizations and especially the MLPs) are doing.

I'm currently planning on how to pursue #3 - in particular, I suspect we have a lot of useful information via 
the compute graphs and gradient functions embedded in the models, and intended for network training.
