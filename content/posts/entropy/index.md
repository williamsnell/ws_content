+++
title = "Entropy"
date = "2024-11-01T13:45:34+13:00"
author = ""
authorTwitter = "" #do not include @
cover = ""
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = true
hideComments = false
color = "" #color from the theme settings
+++
<script src="./mi_charts.js" type="module"></script>
<script src="./knn.js" type="module"></script>
<script src="./observer.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js" charset="utf-8"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
<link href="./charts.css" rel="stylesheet">

Information theory - and in particular, entropy - can be quite an intimidating topic.
It doesn't have to be. If you can develop some key intuitions for the topic, a lot of the concepts
become a lot simpler than they might initially seem.

There are three main sections to this article. If you already have a solid grasp on any of them, feel
free to skip ahead! Each section should hopefully be a bit of fun, though, so don't feel obliged to.

# Table of Contents

1. [What is Entropy?](#what-is-entropy) - If you're new to information theory
2. [Entropy for Continuous Numbers](#entropy-for-continuous-numbers) - If terms like "differential entropy"
aren't familiar.
3. [Mutual Information and Conditional Mutual Information](#mutual-information) - Graphical depictions of 
mutual information and variants thereof, intended to build an intuition for why and how these
measures work.


# What is Entropy?

So let's dive right in... by playing the lottery!

Each round, you get to pick one number on the ticket below:

<div style="width: 100%; margin: auto; margin-bottom: -200px;">
    <object id="ticket" type="image/svg+xml" data="lottery_ticket.svg" height="500px"></object>
    <div id="ticket numbers" style="position: relative; top: -340px; left: 86px; 
        width: 202px; height: 182px; display: flex; flex-wrap: wrap;"></div>
</div>

Once you've picked the number, you can get the results of 
the lottery on the machine below. 

There are two possible outcomes,
and so I only need to send you a single *bit* of information:

- 1, if your ticket is a winner,
- 0, otherwise

It's tiiiiiimmmmmme to play the lottery! Each press of the button below
will pick a **new random number**, and give you the results.

<object id="machine" type="image/svg+xml" data="lottery_machine.svg" style="margin-bottom: -80px"></object>
<script src="./lottery.js"></script>

Did you win? 

Chances are, you didn't. You can keep playing until you do, but be warned,
it might take a while.

It might seem like each time you played, I would send you the same amount of information. Either you won or you lost,
and both times you learned a single bit of information.

*But that's not the whole story.* To see why, let's modify the game slightly. This time,
I want you to tell me **the winning number** for each round. 
Is this possible? Most of the time - no. If your ticket lost, you can eliminate
1 of the 20 numbers, but there's still 19 to pick from!

**However**, if you **won**, you immediately know which number was picked. More 
than that, you also know all the 19 numbers that weren't picked!

The key intuition for understanding entropy is exactly this: the **more likely** a piece of information
is, the **less information** it carries. Formally, we define **Information Content**, sometimes called *surprisal*, as \(\frac{1}{P}\),
where \(P\) is the probability of the event happening. Actually, we need to take the *log* of this term 
to get the exact definition of Information Content:

\[
\begin{align}
            I(x) &= \log_2{\frac{1}{P(x)}} \\
                 &= -\log_2{P(x)}
\end{align}
\]

*Where \(P(x)\) is the probability of event \(x\) occuring, and \(I(x)\) is measured in bits (sometimes 
called Shannons in this context).*

#### Why do we need to take the log? 

Let's think about the lottery. If we had a winning ticket (with probability 
\(P = \frac{1}{20}),\) we only need to be sent a single bit to know that we won.
When we get that message, we immediately know twenty things:
- the 1 winning number
- the 19 numbers that did not win

If I wanted to just send you the winning number directly, and we were using binary, 
we'd need somewhere between 4 bits (\(2^4 = 16\))
and 5 bits (\(2^5 = 32\)) for me to specify which number has won. 

So why do we take the log? Because it takes the **number** of things we've learned, and 
converts it into the *bits of information* we'd need to represent that many things.

In our example, the information content of a winning ticket is:

\[
\begin{align}
        I(\text{win}) &= \log_2{\frac{1}{1/20}} \\
                      &\approx 4.322\;\text{bits}
\end{align}
\]

So in the winning case, I send you a 1-bit message, and with it you've learned about 4.32 bits 
of *information*.

### A Free Lunch?

This might seem too good to be true - greater than perfect compression of more than 4 bits of information
into a single bit message! Of course, this isn't the case.

The winning lottery ticket carries so much information **because** it is
so unlikely. Similarly, a losing lottery ticket tells us very little **because** it's such a common occurrence.
If you can internalize this notion - rare messages carry more information - you can understand entropy
intuitively.

## Defining Entropy

We've talked about *information content* so far, but I promised to explain entropy. Fortunately,
the jump from information content to entropy is almost trivial. We can define entropy as

\[
        H(X) := \mathbb{E}[I(X)]
\]

\(\mathbb{E}\) is the expected value - the mean - and \(I(X)\) is what we defined before, 
the information
content. So the entropy \(H(X)\) is simply the average amount of information contained in all the 
possible messages we could receive.

How do we calculate the average? After all, some messages are much more likely than others. Easy!
We just multiply the *information* of each message by the *likelihood* of receiving that message.

Let's calculate the entropy of the single-bit messages I send you, communicating
the results of the lottery:

\[
        H(\text{Lottery}) = P(\text{win}) I(\text{win}) + P(\text{lose}) I(\text{lose}) \\
\]

Remember from before, that:
\[
                    I(x)  = \log_2{\frac{1}{P(x)}} = -\log_2{P(x)} \\
\]

Therefore,
\[
H(\text{Lottery}) = -P(\text{win}) \log_2{P(\text{win})} \\
                    - P(\text{lose}) \log_2{P(\text{lose})}
\]

We know that \(P(\text{win}) = \frac{1}{20}\) and \(P(\text{lose}) = \frac{19}{20}\), so 
the entropy of the set of messages we could receive is:

\[
\begin{align}
            H(\text{Lottery}) &= -\frac{1}{20} \log_2\left(\frac{1}{20}\right) 
            -\frac{19}{20}\log_2\left(\frac{19}{20}\right) \\
                              &\approx 0.216... +\;0.070... \\
                              &\approx 0.286...
\end{align}
\]

There are a few key takeaways here:

1. We're receiving, on average, a lot less than 1 bit of information per message. 
Our communication scheme is wasting most of its capacity.
2. Roughly 75% of the entropy comes from the rare *win* message. The information
carried by each *lose* message is much, much lower.

Finally, let's introduce the standard formula for entropy. By now, it shouldn't be 
too intimidating. Remember, all it says is that entropy is the average information
content carried by all the messages we could send/receive:

\[
            H(X) := - \sum_{x\in X} p(x) \log_2 {p(x)}
\]

*Where \(x \in X\) just means all the messages \(x\) in the collection of messages that
could be transmitted, \(X\). In the lottery example, \(X = [0, 1]\).*

### Another Entropy Example

To really solidify the concept, lets look at a different binary channel. We can 
receive the message 0 or 1, like in the lottery. However, let's say that both
messages are equally likely: \(P(0) = P(1) = \frac{1}{2}\).

Then,

\[
\begin{align}
            H(X) &= -\left(\frac{1}{2}\log_2\left(\frac{1}{2}\right) + \frac{1}{2}\log_2\left(\frac{1}{2}\right)\right) \\
                 &= -\log_2\left(\frac{1}{2}\right) \\
                 &= \log_2 (2) \\
                 &= 1
\end{align}
\]

In other words, our 1-bit channel has an entropy of 1 bit *if* the two messages 0 and 1 are 
equally likely. If one message is more likely than another, our entropy would decrease, meaning
we would be transferring less useful information per bit, on average.

Without proving this, we can show its consequences. Let's imagine our 1-bit channel now
only ever sends the message *1*. If you will always (as in *always* always) receive the same message, you can't
glean anything useful from it. The entropy of this situation would be 0.

## Consequences

What's interesting about entropy is that it says nothing about the *contents* of the message. In the lottery 
example, we could make the winning message a *0* and the losing message a *1*, and nothing would change. 
At no point does the actual message being sent factor into the calculation. Instead, all that matters
when calculating information content and entropy is *probability*.

This consequence also means that we are free to waste gratuitous amounts of capacity, if we want to,
based on how we *encode* our messages. For example, we could send the strings "WIN" and "LOSE", 
using 3 bytes (24 bits) and 4 bytes (32 bits) respectively. Our channel would still only have 
\(\approx 0.286\) bits of entropy, though.

#### Compression
For our exact case (communicating the results of a lottery), our 1-bit channel is actually optimal. 
We need to send something each time the lottery is drawn - otherwise, how would the receiver know
that they'd received the results? - and the smallest amount of information we can send is a single bit.

This encoding scheme is quite suboptimal for our other problem, though: if we want to know
what number was drawn, we'd have to receive up to 19 losing bits (or 1 winning bit) before we
were certain we knew the winning number. If we wanted to optimize our scheme for transmission of the winning 
number, we could use a 5 bit scheme *(or perhaps a variable-length 4 bit / 5 bit scheme)* to 
just transmit the number directly. But if our receiver is just going to compare the winning number
against the number on the ticket to see if we've won, we've wasted 3 or 4 bits.

This is an example of the [Pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle):
any time we losslessly compress messages on a channel, some kinds of messages get longer, and others get
shorter.

*(It's called the Pigeonhole principle because if you have **n** pigeonholes, you can't put **n+1** messages
in them without putting at least two messages in the same hole. [Pigeonholes are a kind of 
mailbox, although I like the idea of literal pigeons better.] In our case, if we only have 2 messages
and 20 possible winning numbers, 19 of our numbers end up in one kind of message, and only one ends up in the other.)*

# Practical Applications

Information Theory is widely used for analyzing all kind of communication. In his seminal paper -
[A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf) -
Claude Shannon applied the ideas to telecommunication (at the time, the telegraph and the teletype were dominant), artificial
languages *(sequences of characters such as ABBDABCD)*,
as well as to communication in human languages like English. 

Like in our lottery example, real messages written in human language
have *much less entropy* than could theoretically be transmitted with the same set of symbols (for example, the English alphabet.)
We can think of this as *redundancy* - what fraction of the letters in a message we could delete 
before the message lost its original meaning.

As Shannon wrote, 

> The redundancy of a language is related to the existence of crossword puzzles. If the redundancy is 
zero any sequence of letters is a reasonable text in the language and any two-dimensional array of letters
forms a crossword puzzle. If the redundancy is too high the language imposes too many constraints for large
crossword puzzles to be possible.

For this article, however, we will focus on *signal processing*. My claim is that entropy can be explained
visually, and that this visualization provides good intuitive insights. My hope is that
bringing the underlying geometry to the forefront will make it clearer what is going on than 
bombarding you with maths would.

To motivate what would otherwise 
be a very abstract journey, we will examine the function \(Y\). Our goal is to try and determine 
whether \(Y\) is related to \(X_1\) and \(X_2\), using only
samples from \(X_1\), \(X_2\), and \(Y\). We define these signals as such:


\[
\begin{align}
            X_1 &\sim \mathcal{U}(0, 20) \\
            X_2 &\sim \mathcal{U}(-10, 10) \\
            Y &= \sin(X_1) \sin(X_2)\;X_1\;X_2\\
\end{align}
\]

Where \(\mathcal{U}(a, b)\) denotes a uniform distribution between a and b.

\(Y\) is a deterministic function of \(X_1\) and \(X_2\), and so we should be able to figure
out, from samples of the three distributions, that they are all correlated.

If we treat our three distributions as timeseries signals, we can sample from them and
plot their values over time:

<div id="timeseries-plot"></div>


This just looks like a collection of colourful noise. Instead, we can plot each trio of samples as a point in space,
i.e. \((x_1, x_2, y)_t\) for each timestep \(t\):

<div id="teaser-plot"></div>

This function was chosen because:
- It's completely deterministic if you know \(X_1\) and \(X_2\).
- It's decidedly non-linear. There are periodic functions, terms 
multiplied together, but not a linear term in sight. It's a mess!
- The underlying distributions are not normally distributed. 
A lot of successful techniques assume underlying normal distributions,
but we want a technique that doesn't *require* those assumptions hold
to be accurate.
- It looks a bit like a sideways christmas-tree on the \(x_1-y\) plane, and a bit like a bow-tie on 
the \(x_2-y\) plane.

I'm not completely joking with the last point - 
our human brains can *easily* tell that \(Y\), \(X_1\), and \(X_2\) are related. There's 
so much structure in the plot! So many patterns appear before us as we explore the 
space.

Despite this, many common techniques completely fail to detect these patterns.
If we were to use linear analysis techniques - for example, the [Pearson correlation coefficient](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) -
we would get results telling us that \(Y\) is uncorrelated to \(X_1\) and \(X_2\), because
the slopes of \(Y\) against \(X_1\), \(X_2\), or both are on average flat.

Similary, [Spearman's rank correlation coefficient](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
won't help us because \(Y\) is not monotonic.

It's also important that our method distinguishes between the actual generating source (e.g. \(X_1\)) and
an identically distributed but independent source. For example, we could define an independent distribution
with exactly the same *distribution* as \(X_1\):

\[
Q \sim \mathcal{U}(0, 20)
\]

If we were to plot \(Q\) instead of \(X_1\), we get a plot with much less structure. 
Whatever method we end up with, it should be able to distinguish between these
two cases.

<div id="teaser-plot-2"></div>
<script type="module">
import {get_timeseries_chart, get_3d_chart} from "./mi_charts.js";
let x = Array(10_000).fill(0).map((_) => Math.random() * 20);
let y = Array(10_000).fill(0).map((_) => (Math.random() - 0.5) * 10);
let z = x.map((xi, i) => 0.25 * Math.sin(xi) * Math.sin(y[i]) * xi * y[i] + Math.random());
spawn_plot("timeseries-plot", (id) => get_timeseries_chart(id, 
                                        [x.slice(0, 500), y.slice(0, 500), z.slice(0, 500)], 
                                        ['x₁', 'x₂', 'y']));
spawn_plot("teaser-plot", (id) => get_3d_chart(id, x.map((xi, i) => [xi, y[i], z[i]])));
spawn_plot("teaser-plot-2", (id) => get_3d_chart(id, y.map((yi, i) => [x[(i+1)%x.length], yi, z[i]]), 
                                        ['q', 'x₂', 'y']));
</script>

With our challenge posed, let's start building the tools we need to tackle it!

# Entropy for Continuous Numbers

Entropy as defined earlier is quite restrictive:
- We need to know all the possible messages that could be transmitted.
- We need to know the probabilities of receiving each possible message.

In this section, we will extend these concepts into signals made up of continuous 
numbers.

## A Refresher on Continuous Probability Distributions
While some probability distributions are discrete - the outcomes of
rolling dice, our lottery example from before, etc. - a lot of situations call for 
continuous probability distributions. 

As an example, let's look at the normal distribution.
This is arguably the most useful distribution in statistics, and we'd
very much like to characterise its entropy.

<div id="normal distribution chart"></div>
<script type="module">
import {normal_chart} from "./charts.js";
spawn_plot("normal distribution chart", (id) => normal_chart(id));
</script>

The plot above is the *probability density function*, which we label \(p(x)\).
Points are more likely to be sampled from regions of high \(p(x)\) than from low
\(p(x)\). If we sampled 100 points from this distribution, we'd get a
distribution that looks like this:

<div id="normal samples chart"></div>
<script type="module">
import {normal_sample_chart} from "./charts.js";
spawn_plot("normal samples chart", (id) => normal_sample_chart(id));
</script>

We use the lowercase \(p(x)\) to denote probability *density*, which is 
different to the probability for discrete events, \(P(X)\). With a probability
density (and continuous numbers), the likelihood of sampling 
at any exact value of \(x\) is zero. Instead, we integrate
across some range to get the likelihood of a sample falling in that *range*.

For example, with our normal distribution, the likelihood of a point being greater than the mean (\(\mu\))
is 50%. Formally (for a normal distribution),

\[
    \int_\mu^\infty p(x) dx = 0.5
\]

Finally, the integral under the curve of \(p(x)\) from \(-\infty\) to \(\infty\) must equal
exactly 1. That is, when we sample from the distribution, we have to get a point *somewhere*.

## Making Things Discrete

We want a definition of entropy that works for continuous distributions. What we currently
have is a definition for discrete events:

\[
    H(X) = -\sum_{x \in X} P(x) \log_2{P(x)} \\
\]

From our definitions above, we know that we can use the integral of probability density \(p(x)\)
to calculate the likelihood of a point falling in some range (a, b). That is,

\[
    P(a \leq x \leq b) = \int_a^b p(x) dx       
\]
*Here we use the capital \(P\) on the left side because it is an actual probability.*

So, we can approximate a discrete distribution by dividing our continuous interval into
a number of *bins*, and calculating the probabilities of each bin. As we increase the number
of bins, we should get a better and better approximation of the *continous* entropy, whatever
that is. If we divide our domain into \(N\) bins, and the
width of each bin is \(\Delta x\), then we are going to calculate all the information content between
all \((x_i, x_i + \Delta x)\) for i from 0 to \(N\).

Writing this statement in maths, we are saying:

\[
\begin{align}
    H(X) &= -\sum_{x \in X} P(x) \log_2 P(x) \\
         &= -\sum_{i = 0}^{N} \left(\int_{x_i}^{x_i+\Delta x} p(x) dx\right)\:\log_2 \left(\int_{x_i}^{x_i + \Delta x} p(x) dx\right) \\
\end{align}
\]


Finally, instead of actually computing the exact integral, we can approximate it with a 
[Riemann sum](https://en.wikipedia.org/wiki/Riemann_sum). A Reimann sum is quite simple: 
we draw a rectangle from 0 up to a point on the function, \(f(x)\). 
The area of this rectangle is \(f(x) \cdot \Delta x\), where
\(\Delta x\) is the width of the rectangle. 

As we make these rectangles narrower *(under some
conditions)*, our approximation to the integral should get better and better. In other words,
as our rectangle gets narrower (i.e. \(\lim_{\Delta x \rightarrow 0}\)), the area of each rectangle
approaches the integral:

\[
        \lim_{\Delta x \rightarrow 0}\int_{x}^{x + \Delta x} f(x)\:dx = \Delta x \cdot f(x)
\]

With all our tools assembled, we can now practically compute the entropy of our normal distribution.
Substituting in the Reimann approximation to the integral, we have:

\[
\begin{align}
    H(X) &= \lim_{\Delta x \rightarrow 0} -\sum_{i = 0}^{N} p(x_i) \Delta x\:\
    \log_2 p(x_i) \Delta x \\
\end{align}
\]

Play around with the chart below, where we carry out this exact procedure.. 
You should see that as we increase the number of bins, the area under the curve, \(\int_{-\infty}^{\infty} p(x) dx\),
rapidly converges to its true value of \(\approx 1\). This is just our earlier statement, that all of our
points must fall between \((-\infty, \infty)\). 

You might also notice that the entropy \(H(X)\) keeps increasing as the bins get narrower. Worryingly,
this value never converges - it just keeps increasing. If we take the limit of \(\Delta x \rightarrow 0\),
we'll have **infinite** entropy.



<div id="integral"></div>
<script type="module">
import {integral_chart} from "./charts.js";
spawn_plot("integral", (id) => integral_chart(id));
</script>

### What Went Wrong?

This result isn't an issue with any of our assumptions. Instead, we can tease what's going on directly out of the maths.

Let's go back to our continous entropy formula:

\[
\begin{align}
    H(X) &= \lim_{\Delta x \rightarrow 0} -\sum_{i = 0}^{N} p(x_i) \Delta x\:\
    \log_2 \left( p(x_i) \Delta x \right)\\
\end{align}
\]

Looking at the last term, and remembering that \(\log(a \cdot b) = \log(a) + \log(b)\), we can
write it as:

\[
\begin{align}
    \log_2 p(x_i) \Delta x = \log_2 p(x_i) + \log_2 \Delta x \\
\end{align}
\]

Substituting this into the entropy formula,

\[
\begin{align}
    H(X) &= \lim_{\Delta x \rightarrow 0} - \sum_{i = 0}^{N} p(x_i) \Delta x\:\
    \left( \log_2 p(x_i) + \log_2 \Delta_x \right) \\
         &= -\lim_{\Delta x \rightarrow 0} \left(\
            \sum_{i=0}^N p(x_i) \Delta x \log_2 p(x_i) + \sum_{i=0}^N p(x_i) \Delta x \log_2 \Delta x \right) 
\end{align}
\]

In the last line, we split the sum into two sums.
Because \(\log_2 \Delta x\) is a constant, we can bring it out to the front of the second sum, giving us:

\[
\begin{align}
    H(X) &= -\lim_{\Delta x \rightarrow 0} \left(\
            \sum_{i=0}^N p(x_i) \Delta x \log_2 p(x_i) + \log_2 \Delta x \sum_{i=0}^N p(x_i) \Delta x \right) 
\end{align}
\]

But wait! Remembering our Riemann sum approximation, and remembering that the integral of the probability 
density function from \((-\infty, \infty)\) must equal 1,
we have:
\[
\begin{align}
        p(x) \Delta x &\approx \int_x^{x + \Delta x} p(x) dx \\
    \lim_{\Delta x \rightarrow 0} \sum_{i=0}^N  p(x_i) \Delta x &= 1 \\
\end{align}
\]

Substituting this term into the entropy formula, we simplify the second term and rearrange the first:

\[
\begin{align}
   H(X) &= -\lim_{\Delta x \rightarrow 0} \left(\
            \sum_{i=0}^N p(x_i) \log_2 p(x_i) \Delta x + \log_2 \Delta x \cdot 1 \right) 
\end{align}
\]

Finally, we can convert our Riemann sum *back* to an integral, to give us the formula:

> \[
    H(X) = \left(-\int_{-\infty}^{\infty} p(x) \log_2 p(x)\:dx\right)\
    - \lim_{\Delta x \rightarrow 0} \log_2 \Delta x \
    \]

The first term looks pretty sensible - this is the formula for \(H(X)\) that we started
with at the top of this section, but with \(\sum\) swapped for \(\int\), and \(P\) swapped 
for \(p\). 
   
However, the \(\log_2 \Delta x\) term is **bad news** - it blows up to infinity
as \(\Delta x\) approaches 0. In other words, the more slices we use to divide our continous distribution, the 
higher the entropy. This should perhaps not be surprising since, as we said earlier, the probability of getting
any particular number from a continuous distribution is infinitely unlikely, and hence carries infinite information. 
As our bins approach 0 width, this is exactly the situation we get.

### A Flawed Solution: Differential Entropy

What if we just closed our eyes and ignored the \(\log_2 \Delta x\) term? Since it's the part that blows up to infinity, we can 
salvage the rest of the equation and define the *[Differential Entropy](https://en.wikipedia.org/wiki/Differential_entropy)*, 
\(h(X)\), as:

\[
\begin{align}
        h(X) &= H(X) + \lim_{\Delta x \rightarrow 0} \log_2 \Delta x \\
             &= -\int_{-\infty}^{\infty} p(x) \log_2 p(x)\:dx \\
\end{align}
\]

The measure we're left with, \(h(X)\), is a lot less useful than the discrete \(H(X)\) we know 
and love:

1. \(H(X) = 0\) implied no information was transmitted, because we always sent the same message with
100% certainty. \(h(X) = 0\), however, does not have any special meaning. This is because:
2. Differential entropy can be negative. Negative!
3. \(h(X)\) is sensitive to scale (and therefore units). If we measured 100 people's heights,
    \[h_\text{cm} = [167\text{cm}, 185\text{cm}, ...]\] Then we converted the measurements to metres:
    \[h_\text{m} = [1.67\text{m}, 1.85\text{m}, ...]\] 
    The differential entropy of \(h_\text{cm}\) would be *larger* than the differential entropy of \(h_\text{m}\).

One useful property differential entropy does have is *translational invariance*:
\[
        h(X + c) = h(X)
\]

So, with our normal distribution, we can shift the mean wherever we like and keep the same differential
entropy.

This seemingly arbitrary collection of properties has a simple explanation: differential entropy is 
basically a measure of (log of) **volume**. Without being rigorous, we can suggest that:

\[
    V \approx 2^{h(X)}        
\]

Where \(V\) is the volume of a hypercube that fits most of the probability mass of our distribution. For a more
rigorous explanation, see [here](https://stats.stackexchange.com/a/616892).

This intuitive explanation clarifies all of the above properties. 1. and 2. occur because 
volumes can be smaller than 1 (\(2^{-3} = 0.125\), for example.) 3. occurs because when we change units,
the box containing our numbers grows or shrinks in terms of absolute number magnitude 
(even if the actual underlying data is the same.) 

### A Better Solution: Divergence

Differential Entropy, then, isn't the whole answer. To motivate the actual solution, we'll start by
looking at the entropy formula we tried to discretize earlier:

\[
\begin{align}
    H(X) &= \lim_{\Delta x \rightarrow 0} -\sum_{i = 0}^{N} p(x_i) \Delta x\:\
    \log_2 \left( p(x_i) \Delta x \right)\\
\end{align}
\]

The trouble really stems from the last term: 

\[
    \log_2 p(x_i) \Delta x
\]

We want to introduce some term that knocks out this \(\Delta x\). To do so, 
we need to introduce a second distribution - say, as second normal distribution
that may (or may not) have the same mean and variance as our original distribution \(p(x)\). 
We'll label the *probability density function*
of this distribution \(q(x)\).

Instead of measuring the information content of each slice, we could try measuring the *difference*
in information content between \(p(x)\) and \(q(x)\). That is, instead of 

\[\log_2 p(x_i) \Delta x\]

We measure 

\[
\begin{align}
\log_2 p(x_i) \Delta x - \log_2 q(x_i) \Delta x &= \log_2 \frac{p(x_i) \Delta x}{q(x_i) \Delta x} \\
                                                &= \log_2 \frac{p(x_i)}{q(x_i)} \\
\end{align}
\]

Because we want our quantity to still be an expectation value \(\mathbb{E}\), we 
need to weight how likely each slice is, somehow. We can choose \(p(x)\) to do
this weighting. In other words, we're now calculating 

\[
D_{KL}(p || q) = \lim_{\Delta x \rightarrow 0} \sum_{i = 0}^{N} p(x_i) \Delta x\:\
\log_2 \frac{p(x_i)}{q(x_i)} \\
\]

If we really want to use \(q(x)\) to do the weighting (and sometimes we do), we could just 
swap which distribution we call \(p\) and which we call \(q\).

This nicely cancels out the \(\Delta x\) term. But does it work?


<div id="divergence"></div>
<script type="module">
import {integral_chart} from "./charts.js";
spawn_plot("divergence", (id) => integral_chart(id, true));
</script>


Yes! Just as \(P(X) = \int_{-\infty}^{\infty} p(x) dx\) rapidly converges to 1, \(D_{KL}\)
also converges to a constant value, even as \(H(X)\) continues to increase.


### So what *is* the KL-Divergence?

The KL-Divergence is a core tool in Information Theory, for discrete, continuous, and mixed
distributions. With it, we'll build the tools we need to make sense of signals.

To understand the KL-Divergence better, I'd highly recommend reading through [Six (and a half) intuitions for KL divergence.](https://www.lesswrong.com/posts/no5jDTut5Byjqb4j5/six-and-a-half-intuitions-for-kl-divergence)

For now, suffice it to say that the KL-divergence is a measure of the *difference in information*
between two distributions. If we observe a particular event, the information we gain from that 
observation varies depending on the message was generated according to the statistics of one probability
distribution, *p*, or a different one, *q*. 

In our lottery example from earlier, observing a 1 carries a lot of information. But if I was 
secretly sending you a 0 every time the number was odd, and a 1 every time it was even, the 
information content of that "1" message would be lower. The KL-Divergence quantifies this difference,
averaged (using \(p\)) across the whole distribution.

### Why is KL-Divergence an Improvement?

Even though the derivation of KL-Divergence seems more mathematically sound than that of 
differential entropy, is it better in practical ways? To see, let's examine some of its
properties:

1. \(D_{KL}(p || q) = 0\) implies \(p = q\).
2. \(D_{KL} \geq 0\). 
3. \(D_{KL}\) is insensitive to unit changes, rescaling etc. Because we have two probability distributions
\(p\) and \(q\), if we change the units of one, we have to change units of the other. These effects cancel out, 
and we get back the same divergence as we started with. In fact, we can warp our coordinates using an arbitrary 
    function \(y(x)\) which need not be linear, provided that \(y(x)\) is unique for each unique \(x\) (i.e. it
    is [bijective).](https://en.wikipedia.org/wiki/Bijection)

KL-Divergence has one major consideration, though: anywhere \(p(x) > 0\), \(q(x)\) **must** be greater than
0, too. Otherwise, the \(p(x) \log\frac{p(x)}{q(x)}\) term blows up to \(\infty\), and with it the divergence.

With this tool, we now have a firm footing for using information theory in continuous domains. We can
build on it to obtain the *mutual information*, the tool we will use to finally solve our problem.

# Mutual Information

When it comes to determining if two signals are correlated, mutual information is the tool we've been looking for.
Yet, it is also subtly different from what we might've expected. Mutual information tells us how much information we learn about a signal \(Y\) if we were 
to observe samples of a different signal, \(X\). 

Formally, the mutual information between two distributions \(X\) and \(Y\), \(I(X;Y)\), is defined as

\[
            I(X;Y) = D_{KL} (P_{(X,Y)} || P_X \otimes P_Y)
\]

\(P_{(X,Y)}\) is the [joint distribution](https://en.wikipedia.org/wiki/Joint_probability_distribution) of X and Y,
\(P_X\) and \(P_Y\) are the [marginal distributions](https://en.wikipedia.org/wiki/Marginal_distribution) or X and Y
respectively, and \(\otimes\) is the element-wise product between them. 

That's a lot of words!  I promise it'll make more sense when you see 
it in action. For now, there are some important properties to note:

1. \(I(X;Y) = 0\) *if and only if* \(X\) is independent of \(Y\).
2. \(I(X;Y) \geq 0\).
3. \(I(X;Y) = I(Y;X)\) - that is, mutual information is *symmetric*.
4. \(I(X;X) = H(X)\). For continuous signals, the amount of information gained (or uncertainty removed) about \(X\)
by observing \(X\) is \(\infty\). This applies too for \(I(X;f(X)\) where \(f()\) is invertible (i.e. bijective.)

## The Histogram Method

There are a number of ways to estimate mutual information. The most straightforward approach would be to divide the space
into lots of bins, and count how many samples fall into each bin. We could then assume the probability is constant 
across each bin, giving an estimate for \(p(x)\):

\[
    \hat{p}(\text{bin}) = \frac{n_\text{bin}}{n_\text{total}}
\]

We could apply the same technique, with the same bins, to sample from \(q\) and estimate \(q(x)\) as \(\hat{q}(\text{bin})\). 

We immediately run into problems, though. Anywhere one or more samples from \(p\) fall into a bin, that 
bin **must** also capture at least one sample from \(q\). Otherwise, the estimated probability of \(q = 0\), 
and we blow up the KL-divergence to infinity (recall, mutual information is a special application of the KL-divergence.)

In practice, this means we need lots of samples **and** large bin sizes, neither of which are ideal.

# K-Nearest Neighbors

Instead, we'll use K-Nearest-Neighbors (KNN). This technique can be used for a number of problems, although we'll
use it to estimate the mutual information directly (as per [Kraskov, Stögbauer, and Grassberger](https://arxiv.org/pdf/cond-mat/0305641)).

K-nearest-neighbors can be thought of as a "dynamic binning" method - it only runs calculations in areas 
where samples have actually fallen. Before we dive into the maths, lets have a play around with it. In this plot,
we sample from a uniform distribution on the x axis, and feed samples of x through the sine function - before 
adding some noise - to get y.
\[
\begin{align}
X = \mathcal{U}(0, 5) \\
Y = \sin(X) + \mathcal{U}(0, 1) \\
\end{align}
\]

So, our two signals are correlated, but not perfectly.

<div id="plot"></div>
<script type="module">
import {get_2d_mi_chart} from "./mi_charts.js";
let x = Array(500).fill(0).map((_) => Math.random() * 5);
let y = x.map((xi) => Math.sin(xi) + Math.random() * 1);
spawn_plot("plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, y[i]]), 5));
</script>

What's going on is:

For each point \((x_i, y_i)\):
1. Calculate the distance, \(d_k\) to the Kth nearest neighbor (e.g. if k=5, 
    \(d_5\) is the distance to the third nearest neighbor to \(x_i\)). We calculate distance using 
    the [Infinity Norm](https://en.wikipedia.org/wiki/Uniform_norm), i.e. \(d = \max(d_x, d_y)\). Hence,
    we know there are exactly \(k\) points within a hypercube of side-length \(d\).
2. Ignoring the x-direction, calculate \(n_y\), the number of points that are within a distance \(d_k\) of \(y_i\).
3. Ignoring the y-direction, calculate \(n_x\), the number of points that are within a distance \(d_k\) of \(x_i\).

Then, the mutual information can be estimated as 

\[
        I(X;Y) \approx \psi(k) + \psi(N) - \frac{1}{N} \sum_{i=0}^N \psi(n_x + 1) + \psi(n_y + 1)
\]

\(\psi(x)\) is the [Digamma function](https://en.wikipedia.org/wiki/Digamma_function), which is close to \(\log(x)\) for
large x. N is the number of points, k is the k from K-nearest-neighbors, and \(n_x\) and \(n_y\) are the values
described above.

The reason we can just take an average over all our points without needing to weight by \(p(x)\) is because
KNN naturally samples more in areas of high probability, and less in areas of low probability. Because each bin
is dynamically constructed around points actually sampled from our distributions, the probability weighting happens
for free.

Again, this formula is not the most illuminating. We need to pick it apart to really understand what's going on.
Recall that \(I(X;Y) = 0\) *if and only if* the two signals are uncorrelated. For our formula to equal zero,
either \(n_x\) or \(n_y\) (or both) would have to be, on average, very close to \(N\), the total number of points. 
We can actually extend this further. For large \(n\), we have very approximately:

\[
    \psi(n) \approx 2 \cdot \psi(\sqrt{n})
\]

In other words, if we have \(N\) points, \(n_x\) and \(n_y\) each only need to be slightly larger than
\(\sqrt{N}\) for the mutual information to be 0. We'll see a visual representation of this later.

On the other hand, if \(n_x\) and \(n_y\) are small most of the time, the mutual information would be very high. 

We can maximise mutual information if the only points captured in our \(n_x\) and \(n_y\) bounds were already
captured inside our k-nearest neighbors. In some sense, the "sharper" the line in our plot is, the fewer
points will be captured by \(n_x\) and \(n_y\). As we add noise, the line gets fuzzier, and \(n_x\) and \(n_y\)
increase.

Also note that \(n_x\) and \(n_y\) are treated identically by the function. This again highlights the 
symmetric nature of mutual information: \(I(X;Y) = I(Y;X)\).

Finally, the \(\psi(N)\) term means that in cases of very high mutual information, the exact
number we get will depend on the number of samples we analyse. If \(X\) is continuous and \(Y = X\), for example,
the true mutual information should be infinite. Instead, we will see it gradually increase as the number of 
samples increases, much like the differential entropy from earlier. Typically, \(Y\) is not exactly equal to
\(X\), for example if some extra noise were added, which means that mutual information typically plateaus
at some (high) value, even for very correlated signals.

### Illustrative Examples of Mutual Information

So, we can maximize mutual information by capturing as few points in our \(n_x\) and \(n_y\) bounds 
as possible. One way to do that very effectively is to have \(Y\) be a linear function of \(X\). E.g.

\[
\begin{align}
    X = \mathcal{U}(0, 5) \\
    Y = X;
\end{align}
\]

Indeed, this gives us a very high mutual information score.

<div id="very-linear-plot"></div>
<code id="linear-text"></code>
<script type="module">
import {get_2d_mi_chart} from "./mi_charts.js";
let x = Array(500).fill(0).map((_) => Math.random() * 5);
let y = x.map((xi) => xi);
spawn_plot("very-linear-plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, y[i]]), 5));
//
const worker = new Worker("./worker.js", { type: "module"} );
worker.onmessage = (e) => {
    document.getElementById("linear-text").textContent = `Estimated Mutual Information = ${e.data}`;
};
worker.postMessage(["MI", x.map((x, i) => [x, y[i]]), 5]);
</script>

But mutual information does not **require** linearity. For example, the 
following very non-linear function which would flummox any linear analysis 
(but is obviously quite correlated to the naked eye) also gives us a high 
mutual information score:
    
\[
\begin{align}
X &= \mathcal{U}(0, 5) \\
Y &= \left\{ \begin{array}{ll}
           x & 0 \leq x < 1 \\
           -x & 1 \leq x < 2 \\
           x & 2 \leq x < 3 \\
           ... & \\
\end{array}
\right.
\end{align}
\]

<div id="very-nonlinear-plot"></div>
<code id="very-nonlinear-text"></code>
<script type="module">
import {get_2d_mi_chart} from "./mi_charts.js";
let x = Array(500).fill(0).map((_) => Math.random() * 5);
let y = x.map((xi) => xi * ( 1 + Math.floor(xi % 2) * -2));
spawn_plot("very-nonlinear-plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, y[i]]), 5));
//
const worker = new Worker("./worker.js", { type: "module"} );
worker.onmessage = (e) => {
    document.getElementById("very-nonlinear-text").textContent = `Estimated Mutual Information = ${e.data}`;
};
worker.postMessage(["MI", x.map((x, i) => [x, y[i]]), 5]);
</script>

Mutual information is subtle, though. Just because \(y\) might be a 
function of \(x\) doesn't mean mutual information is maximised. Take the 
following distributions, 

\[
\begin{align}
X &= \mathcal{U}(0, 20) \\
Y &= \sin(X) \\
\end{align}
\]


<div id="sine-plot"></div>
<code id="sine-text"></code>
<script type="module">
import {get_2d_mi_chart} from "./mi_charts.js";
let x = Array(2000).fill(0).map((_) => Math.random() * 20);
let y = x.map((xi) => Math.sin(xi));
spawn_plot("sine-plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, y[i]]), 5));
//
const worker = new Worker("./worker.js", { type: "module"} );
worker.onmessage = (e) => {
    document.getElementById("sine-text").textContent = `Estimated Mutual Information = ${e.data}`;
};
worker.postMessage(["MI", x.map((x, i) => [x, y[i]]), 5]);
</script>

Notice how the samples for \(n_y\) come from multiple different cycles of
the sine wave. Also, remember that mutual information is **symmetric**. So, 
even though knowing \(x\) tells us exactly what \(y\) will be, knowing 
the value of \(y\) doesn't let us pinpoint an exact \(x.\) Instead, we know
\(x \mod 2\pi \), but there are still an infinite number of \(x\)'s for every
\(y.\)

Another way to think about this is that, probabilistically, there are lot of different
ways to get a particular value of \(y\), and so actually getting that value isn't too surprising.
Each value of \(x\), however, is more surprising. Since information content increases with surprise, 
we learn more by observing \(x\) than we do \(y\), and so they cannot have maximum mutual information.

Finally, we can *minimize* mutual information by introducing noise that isn't shared between our signals.
We get a value of 0 when there is nothing in common between \(X\) and \(Y\):
For example,

\[
\begin{align}
X &\sim \mathcal{U}(0, 20) \\
Y &\sim \mathcal{U}(0, 20) \\
\end{align}
\]

<div id="uncorrelated-plot"></div>
<code id="uncorrelated-text"></code>
<script type="module">
import {get_2d_mi_chart} from "./mi_charts.js";
let x = Array(2000).fill(0).map((_) => Math.random() * 20);
let y = Array(2000).fill(0).map((_) => Math.random() * 20);
spawn_plot("uncorrelated-plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, y[i]]), 5));
const worker = new Worker("./worker.js", { type: "module"} );
worker.onmessage = (e) => {
    document.getElementById("uncorrelated-text").textContent = `Estimated Mutual Information = ${e.data}`;
};
worker.postMessage(["MI", x.map((x, i) => [x, y[i]]), 5]);
</script>

Like we said earlier, it's clear that neither \(n_x\) nor \(n_y\) are capturing anywhere close to the full
\(N\) points in the x-y plane. However, because \(x\) and \(y\) are uncorrelated, the amount of points
falling in each bin is roughly \(\frac{\text{bin width}}{\text{total width}}\). 

Imagine the space our points live in as a square with area \(n^2\). Then, our side-lengths would
be \(n\). We could divide the square into wide strips of height 1, giving us \(n\)
strips of area \(n\), or we could divide it into tall strips of width 1, also giving us \(n\)
strips of area \(n\).

If we just rename \(n^2\) to \(N\), our total number of points, we get the expectation
that if our points are uniformly distributed in the x-y space, 
the number of points captured in a wide strip of height 1 (or a tall
strip of width 1) should be \(\sqrt{N}\). In other words, if the orange square
that holds our K nearest neighbors held 1 point, we should expect \(n_x\) and \(n_y\)
to both hold \(\sqrt{N}\) points in this uncorrelated case.

Earlier, we established that:
\[
    \psi(n) \approx 2 \cdot \psi(\sqrt{n})
\]

Also, we know our equation for mutual information is:

\[
        I(X;Y) \approx \psi(k) + \psi(N) - \frac{1}{N} \sum_{i=0}^N \psi(n_x + 1) + \psi(n_y + 1)
\]

So, very roughly, if \(n_x\) and \(n_y\) capture \(\sqrt{N}\) points each (as they would if 
the points were uniformly distributed along the x and y axes), the mutual information would 
tend to zero. (\(n_x\) or \(n_y\) need to be slightly larger to cancel out the \(\psi(k)\) 
term. This could be seen as compensating for the fact that our \(n_x\) and \(n_y\) bins are 
not infinitely thin, and so capture the same points multiple times). 

For non-uniform (but still uncorrelated) distributions, this analogy still 
works. We just have to remember that the KNN algorithm
makes the bins smaller in more dense regions, and larger in less dense regions. So, we could imagine
this process as the algorithm first clustering or spreading out points so that they 
are evenly distributed, and then counting the area in each constant-width strip.

Finally, let's look at our 3 signals from much earlier in the article. Recall,

\[
\begin{align}
            X_1 &\sim \mathcal{U}(0, 20) \\
            X_2 &\sim \mathcal{U}(-10, 10) \\
            Y &= \sin(X_1) \sin(X_2)\;X_1\;X_2\\
\end{align}
\]

We can calculate the mutual information between \(X_1\) and \(Y\):

<div id="2d-hero-plot"></div>
<code id="mi-text-2d"></code>

While the mutual information isn't as high as it would be for a purely bijective
function, it's still significant. Even though the average slope of \(X_1\) vs \(Y\)
is flat, and even despite the noise from the unaccounted for \(X_2\), mutual information
is successful in telling us that, yes, our signals are correlated. 

As we increase the number of samples, the estimated mutual information will continue to climb.
Potentially, we could tackle this would by normalizing the mutual information estimate against
it's maximum possible value - something like: 

\[
    \hat{I}(X;Y) = \frac{\psi(k) + \psi(N) - \frac{1}{N} \sum_{i=0}^N \psi(n_x + 1) + \psi(n_y + 1)}{\psi(N)}
\]

Here, \(\hat{I}\) close to 1 implies maximum information shared, and \(\hat{I} = 0\) implies
no information shared between \(X_1\) and \(Y\). It's not completely clear whether this quantity
has a direct link back to information theory, though. It's somewhat close to the [Rajski Distance](https://en.wikipedia.org/wiki/Mutual_information#Metric),
defined as:

\[
    D(X, Y) = 1 - \frac{I(X;Y)}{H(X,Y)}
\]

Perhaps we could derive a mathematically sound version of this metric that converges 
to a useful value, and would give us a useful, normalized criteria for comparing signals.

### Handling the Second Input

We can't let \(X_1\) have all the fun. Let's calculate the mutual
information between \(X_2\) and \(Y\).

<div id="2d-hero-plot-x2"></div>
<code id="mi-text-2d-x2"></code>

We should pause for a moment, though. This approach doesn't really take into account the fact that we need
both \(X_1\) and \(X_2\) to fully define a value of \(Y\). Looking only at 
one input and one output at a time also doesn't tell us whether \(X_1\) carries
unique information about \(Y\) that \(X_2\) does not, or if we're just double-counting
the same information each time.

To figure out if both \(X_1\) and \(X_2\) are correlated to \(Y\), **and** that \(X_2\)
carries information \(X_2\) does not, we need to go deeper.

# Conditional Mutual Information

There are a lot of extensions of mutual information to more variables. For our example,
we're interested in the [Conditional Mutual Information](https://en.wikipedia.org/wiki/Conditional_mutual_information).

Although it's typically written as \(I(X;Y|Z)\), we'll use the terminology \(I(X_1;Y|X_2)\). This way, all our 
inputs are X's, and our output is Y. 

Conditional mutual information tells us how much of the mutual information \(I(X_1;Y\) between 
\(X_1\) and \(Y\) is *not* found in \(X_2\). In other words, if \(I(X_2;Y) > 0\), we know
that \(X_2\) and \(Y\) share some information; if \(I(X_1;Y|X_2) = 0\), we then know that
all the information \(X_2\) told us about \(Y\) could have been learned by observing
\(X_1\) instead. 

As you can probably tell by the notation, conditional mutual information treats
its inputs differently. There is still some symmetry:

\[
I(X_1;Y|X_2) = I(Y;X_1|X_2)
\]

However, interchanging \(X_2\) with the other inputs gives us a different result. This 
is important because if \(X_2\) is completely irrelevant (i.e. uncorrelated random noise),
the conditional mutual information reduces to:

\[
    I(X_1;Y|X_2) = I(X_1;Y)
\]


<div id="3d-plot"></div>
<code id="mi-text"></code>

So, how do we calculate conditional mutual information? Well, it's actually very similar
to how we calculated mutual information in the 2d case. We can use [Frenzel and Pompe's](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.99.204101)
modification of the [KSG estimator](https://arxiv.org/pdf/cond-mat/0305641) from earlier.

For each point p, we calculate
the distance \(d\) to the k-th nearest neighbor (again using the infinity norm), and then count:
1. \(n_{x_2}\) - the number of points within a distance \(d\) from p, ignoring both the 
\(x_1\) and \(y\) coordinates. 
2. \(n_{x_1, x_2}\) - the number of points within a distance \(d\) from p, ignoring 
the \(y\) coordinate.
3. \(n_{x_2, y}\) - the number of points within a distance \(d\) from p, ignoring 
the \(x_1\) coordinate.

Even though we now have 3 hyper-rectangles to keep track of, the process is very similar to before - we're 
basically taking a number of 2d-slices of our 3d space, and computing the mutual information
within each slice. \(n_{x_2}\) can be thought of as \(N\), the total number of points in our 
MI estimator; \(n_{x_1, x_2}\) is analogous to \(n{x_1}\) and \(n_{x_2, y}\) is analogous to
\(n_{y}\). 

So, the formula is:

\[
        I(X_1;Y|X_2) \approx \psi(k) - \frac{1}{N} \sum_{i=0}^N \psi(n_{x2}) - \psi(n_{x_1,x_2}) - \psi(n_{x_2,y}) 
\]

So, conditional mutual information is high if for each slice of \(X_2\), we have high mutual information between
\(X_1\) and \(Y\).

*(The nearest-neighbor hypercube in the 3d plots might look a little squashed. This is just a plotting
artifact, because the variance of our function is much larger in the z-direction than x or y. The cube is
still a cube, we just have a squashed z-direction.)*

One important test we defined earlier is being able to distinguish between a random variable that is 
*in distribution*, but not actually correlated to the signal, and a correlated variable with the same
distribution. For example we could define an unrelated variable \(Q\) with \(X_1\text{'s}\) distribution:

\[
            Q \sim \mathcal{U}(0, 20) \\
\]

Does conditional mutual information distinguish between these two cases?

<div id="3d-plot-2"></div>
<code id="mi-text-2"></code>

Recall that conditional mutual information \(I(X_1;Y|X_2)\) becomes equivalent to mutual information \(I(X_1;Y)\) if 
the conditioning variable, \(X_2\), is uncorrelated to \(X_1\) and \(Y\). In this case, we know that \(Q\) is
uncorrelated, and so \(I(X_1;Y|Q)\) should equal the value of \(I(X_1;Y)\) we calculated in the previous section. 
While the value is close, it's not an exact match. This is likely an issue of finite sample sizes, and should
improve as the number of points sampled increases. 

At the very least, we appear to get a much stronger result (~1.5) when calculating \(I(X_1;Y|X_2)\) vs
the ~0.3 we get with \(I(X_1;Y|Q)\). 

Recall, also, that conditional mutual information is not symmetric. Since \(Q\) carries no information
about \(Y\), we should be able to swap the order of signals and get back a result of 0. I.e.
\(I(Q;Y|X_1) = I(Q;Y) = 0\). 

If we run this through our estimator, we do in fact get back 0:

<code id="mi-text-q2"></code>


Finally, we should consider what happens when \(X_1\) and \(X_2\) carry the same information. They don't
have to be identical signals, provided the transformation is bijective, and in fact we can show this by calculating

\[
    I(X_1;Y|X_1^2)
\]

That is, we just take \(X_1\) and square it to get our second signal. This carries no extra information over \(X_1\),
but certainly looks quite different. Will the conditional mutual information algorithm be able to pick this up?


<div id="3d-plot-3"></div>
<code id="mi-text-3"></code>

Not a problem! In fact, this plot gives us a clear example of what \(X_1\) and \(X_2\) carrying the same
information looks like. Just like earlier where thin, sharp lines meant high mutual information, the same
shapes on the x1-x2 plane implies zero conditional mutual information.

<script type="module">
import {get_2d_mi_chart, get_3d_mi_chart} from "./mi_charts.js";
let x = Array(10_000).fill(0).map((_) => Math.random() * 15);
let y = Array(10_000).fill(0).map((_) => (Math.random() - 0.5) * 15);
let z = x.map((xi, i) => 0.25 * Math.sin(xi) * Math.sin(y[i]) * xi * y[i] + Math.random() * 0.5);
//
import {mutual_information, partial_mutual_information} from "./knn.js";
spawn_plot("2d-hero-plot", (id) => get_2d_mi_chart(id, x.map((xi, i) => [xi, z[i]]), 5));
;
// 
spawn_plot("2d-hero-plot-x2", (id) => get_2d_mi_chart(id, y.map((xi, i) => [xi, z[i]]), 5));
// 
spawn_plot("3d-plot", (id) => get_3d_mi_chart(id, x.map((xi, i) => [xi, y[i], z[i]]), 5));
//
spawn_plot("3d-plot-2", (id) => get_3d_mi_chart(id, x.map((xi, i) => [xi, y[(i + 1) % y.length], z[i]]), 5));
//
spawn_plot("3d-plot-3", (id) => get_3d_mi_chart(id, x.map((xi, i) => [xi, xi**2, z[i]]), 5));

let queue = [
    [["MI", x.map((x, i) => [x, z[i]]), 5],
    (e) => {document.getElementById("mi-text-2d").textContent = `Estimated I(X1;Y) = ${e.data}`;}],
    [["MI", y.map((x, i) => [x, z[i]]), 5],
    (e) => {document.getElementById("mi-text-2d-x2").textContent = `Estimated I(X2;Y) = ${e.data}`;}],
    [["PMI", x, y, z, 5], 
    (e) => {document.getElementById("mi-text").textContent = `Estimated I(X1;Y|X2) = ${e.data}`;}],
    [["PMI", x, z, y.map((_, i) => y[(i+1)%y.length]), 5],
    (e) => {document.getElementById("mi-text-2").textContent = `Estimated I(X1;Y|Q) = ${e.data}`;}],
    [["PMI", y.map((_, i) => y[(i+1)%y.length]), z, x, 5],
    (e) => {document.getElementById("mi-text-q2").textContent = `Estimated I(Q;Y|X1) = ${e.data}`;}],
    [["PMI", x, z, x.map((x) => x**2), 5],
    (e) => {document.getElementById("mi-text-3").textContent = `Estimated I(X1;Y|X1^2) = ${e.data}`;}]
];
const worker = new Worker("worker.js", { type: "module" });

let i = 0;

worker.onmessage = (e) => {
    // call the most recent callback
    queue[i][1](e);  

    i += 1;
    if (i > queue.length) {
        // exit the loop
        worker.onmessage = () => {};
    } else {
        // send the next job
        worker.postMessage(queue[i][0]);
    }
}

worker.postMessage(queue[0][0]);


</script>

# Conclusion

Well done for making it all this way! If you, like me, started this article without a solid grasp on what information
entropy actually is, I hope you now have an intuitive feeling for not just what it represents, but why it might be useful. 

More than that, I hope you've been able to see how even quite involved information theory measures like *conditional
mutual information* can be explained geometrically. If a few of the concepts haven't quite clicked - that's ok! Come back
in a few days when you've had some time to think about it, play around with the plots again, and try and understand
*why* a given plot has high or low entropy, mutual information, or partial mutual information.
