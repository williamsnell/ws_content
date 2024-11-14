+++
title = "Entropy"
date = "2024-11-01T13:45:34+13:00"
author = ""
authorTwitter = "" #do not include @
cover = ""
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = false
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
It doesn't have to be. If you can develop some key intuitions for the topic, you can
learn and use entropy!

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
\(P = \frac{1}{20}\)), we only need to be sent a single bit to know that we won.
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
so unlikely. Similarly, a losing lottery ticket tells us very little **because** it's such a common occurence.
If you can internalize this notion - rare messages carry more information - you can understand entropy
intuitively.

## Defining Entropy

We've talked about *information content* so far, but I promised to explain entropy. Fortunately,
the jump from information content to entropy is almost trivial. We can define entropy as

\[
        H(X) := \mathbb{E}[I(X)]
\]

\(\mathbb{E}\) is just the expected value - the mean - and \(I(X)\) is what we defined before, 
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
Our communication scheme is wasting most of its bandwidth.
2. Roughly 75% of the entropy comes from the rare *win* message. The information
carried by each *lose* message is much, much lower.

Finally, let's introduce the standard formula for entropy. By now, it shouldn't be 
too intimidating. Remember, all it says is that entropy is the average information
content carried by a message.

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
we would be transferring less useful information per bit.

Without proving this, we can show its consequences. Let's imagine our 1-bit channel now
only ever sends the message *1*. If you will always (as in *always* always) receive the same message, you can't
glean anything useful from it. The entropy of this situation would be 0.

## Consequences

What's interesting about entropy is that it says nothing about the *contents* of the message. In the lottery 
example, we could make the winning message a *0* and the losing message a *1*, and nothing would change. 
At no point does the actual message being sent factor into the calculation. Instead, all that matters
when calculating information content and entropy is *probability*.

This consequence also means that we are free to waste gratuitous amounts of information, if we want to,
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
We can think of this as *redundancy* - what fraction of the letters in a message could we delete 
before it lost its original meaning.

As Shannon wrote, 

> The redundancy of a language is related to the existence of crossword puzzles. If the redundancy is 
zero any sequence of letters is a reasonable text in the language and any two-dimensional array of letters
forms a crossword puzzle. If the redundancy is too high the language imposes too many constraints for large
crossword puzzles to be possible.

For this article, however, we will focus on *signal processing*. My claim is that entropy can be explained
visually, and that this visualization provides good intuitive insights. My hope is that
bringing the underlying geometry to the forefront will make it obvious what is going on.

To motivate what would otherwise 
be a very abstract journey, we will examine the function \(f\). Our goal is to try and determine 
whether f is related to \(X\) and \(Y\), using only
samples from \(X\), \(Y\), and \(f\).


\[
\begin{align}
            X &\sim \mathcal{U}(0, 40) \\
            Y &\sim \mathcal{U}(-25, 25) \\
            f &\sim \sin(X) \sin(Y)\;X\;Y + \mathcal{N}(0, 1)\\
\end{align}
\]

\(f\) is mostly a deterministic function of \(X\) and \(Y\), although there's a
sprinkling of gaussian noise (the \(\mathcal{N}(0, 1)\) term) for reasons
I'll explain later.


!!! TO DO: 
- 3d plot of x, y, f
- buttons that flip the view to \(f(X | Y)\) etc.

This function was chosen because:
- It's completely deterministic if you know \(X\) and \(Y\).
- It's decidedly non-linear. There are periodic functions, terms 
multiplied together, but not a linear term in sight. It's a mess!
- The underlying distributions are not just normally distributed. 
A lot of successful techniques assume underlying normal distributions,
but we want a technique that doesn't *require* those assumptions hold
to be accurate.
- It looks like a Christmas tree from one side and a bow-tie from the other.

I'm not completely joking with the last point - 
our human brain can *easily* tell that \(f\), \(X\), and \(Y\) are related. There's 
so much structure in the plot! So many patterns appear before us as we explore the 
space.

Despite this, many conventional data analysis techniques 

If we were to use linear analysis techniques - for example, the [Pearson correlation coefficient](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) -
we would get results telling us that \(f\) is uncorrelated to \(X\) and \(Y\), because
the slopes of \(f\) against \(X\), \(Y\), or both are on average flat.

Similary, [Spearman's rank correlation coefficient](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
won't help us because \(f\) is not monotonic.

It's also important that our method distinguishes between the actual generating source (e.g. \(X\)) and
an identically distributed but independent source (e.g. \(Q \sim \mathcal{U}(0, 40)\)) which
just happens to share population statistics. Again, if we were to plot \(Q\) instead of \(X\) 


!!!TO DO: swap X with X[shift 1]!!!


, the
distinction is obvious. Looking at population statistics like the mean and variance of \(Q\) and \(X\),
however, would not distinguish between the two. Even some entropy measures - if poorly chosen - could
fail to separate the two distributions. The KL-divergences \(D_{KL}(f||Q)\) and \(D_{KL}(f||X)\), 
for example, should be equal to one another.


Note that we do not require our method to prove there is a **causal** relationship 
between \(f\), \(X\), and \(Y\). It can (and does) produce the same results whether
f is truly a function of \(X\) and \(Y\), or f is a function of some other variables
that happen to be (perfectly) correlated with \(X\) and \(Y\). If we think in terms
of how much information knowing \(X\) or \(Y\) tells us about \(f\), this distinction 
is irrelevant.

## Key Concept 1: Mutual Information

An information theory concept that seems quite promising is the [Mutual Information](https://en.wikipedia.org/wiki/Mutual_information),
\(I(X;Y)\). *(In our particular case, we might be interested in something like \(I(f;X)\), \(I(f;Y)\).)*

It describes how much information we learn about \(X\) if we know the value of \(Y\).

Mutual information has many definitions, some of which are given below:

\[
\begin{align}
    I(X;Y) &\equiv H(X) - H(X | Y) \\
           &\equiv H(X) + H(Y) - H(X,Y) \\
\end{align}
\]

The first definition says that Mutual Information is the entropy of \(X\) minus
the entropy of \(X | Y\). \(X | Y\) is the conditional entropy of X given Y. If that 
description means nothing to you, play around with the plot below. 

Conditional entropy has two helpful properties: 
1. \(H(Y|X) = 0\) if and only if knowing X tells us the exact value of Y.
2. \(H(Y|X) = H(Y)\) if and only if \(Y\) and \(X\) are independent random variables.

Visually, we can plot the conditional *distribution* \(Y|X\) and from it qualitatively
assess the entropy:
1. If \(H(Y|X) = 0\), the plot of \(Y|X\) will be a "thin" line, where each value of \(Y\)
maps exactly to a single value of \(X\).
2. If \(H(Y|X) = H(Y)\), the spread of \(Y\) is uniform across all \(X\). In other words,
we should get a cloud of points with constant density from left to right, and (potentially)
changing density as we go up or down.

!!!! Conditional Distribution Plot !!!!!

The second definition says that Mutual Information is the entropy of \(X\) plus 
the entropy of \(Y\) minus the entropy of \(X, Y\). \(X, Y\) is the *joint distribution*
of \(X\) and \(Y\), and can be visualized below.

!!!! Joint Distribution Plot !!!!!

The Joint Distribution



## Entropy for Continuous Numbers

Entropy as defined earlier is quite restrictive:
- We need to know all the possible messages that could be transmitted.
- We need to know the probabilities of receiving each possible message.

##### A Refresher on Continuous Probability Distributions
While some probability distributions are discrete - the outcomes of
rolling dice, our lottere example from before, etc. - a lot of situations call for 
continuous probability distributions. 

As an example, let's look at the normal distribution.
This is arguably the most useful distribution in statistics, and we'd
very much like to characterise its entropy.

<div id="normal distribution chart"></div>
<script type="module">
import {normal_chart} from "./charts.js";
normal_chart("normal distribution chart");
</script>

The plot above is the *probability density function*, which we label \(p(x)\).
Points are more likely to be sampled from regions of high \(p(x)\) than from low
\(p(x)\). If we sampled 100 points from this distribution, we'd get a
distribution that looks like this:

<div id="normal samples chart"></div>
<script type="module">
import {normal_sample_chart} from "./charts.js";
normal_sample_chart("normal samples chart");
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

##### Making Things Discrete

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

You might also notice that the entropy \(H(X)\) keeps increasing as the bins get narrower. Worryingly, i
this value never converges - it just keeps increasing. If we take the limit of \(\Delta x \rightarrow 0\),
we'll have **infinite** entropy.



<div id="integral_chart" style="display: flex;"></div>
<div id="button-bar" style="display: flex;">
<button id="integral_chart -">Fewer Bins</button>
<button id="integral_chart +">More Bins</button>
<div id="integral_chart text" style="margin-left: 100px;"></div>
</div>
<script type="module">
import {integral_chart} from "./charts.js";
integral_chart("integral_chart");
</script>

##### What Went Wrong?

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

##### A Bad Solution: Differential Entropy

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
    The differential entropy of h would be *larger* than the differential entropy of h2.

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
the box containing our numbers grows or shrinks (even if the actual underlying data is the same.) 

##### A Good Solution: Divergence

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
we need to introduce a second distribution. We'll label the *probability density function*
of this distribution \(q(x)\).

What if instead of measuring the information content of each slice, we measured the *difference*
in information content between \(p(x)\) and \(q(x)\). That is, instead of 

\[\log_2 p(x_i) \Delta x\]

We measure 

\[
\begin{align}
\log_2 p(x_i) \Delta x - \log_2 q(x_i) \Delta x &= \log_2 \frac{q(x_i) \Delta x}{p(x_i) \Delta x} \\
                                                &= \log_2 \frac{q(x_i)}{p(x_i)} \\
\end{align}
\]

In other words, we're now calculating 

\[
D_{KL}(p || q) = - \lim_{\Delta x \rightarrow 0} \sum_{i = 0}^{N} p(x_i) \Delta x\:\
\log_2 \frac{q(x_i)}{p(x_i)} \\
\]

This nicely cancels out the \(\Delta x\) term. But does it work?



<div id="divergence_chart" style="display: flex;"></div>
<div id="divergence_chart history" style="display: flex;"></div>
<div id="button-bar" style="display: flex;">
<button id="divergence_chart -">Fewer Bins</button>
<button id="divergence_chart +">More Bins</button>
<div id="divergence_chart text" style="margin-left: 100px; display: none;"></div>
</div>
<script type="module">
import {integral_chart} from "./charts.js";
integral_chart("divergence_chart", "divergence_chart history");
</script>


Yes! Just as \(P(X) = \int_{-\infty}^{\infty} p(x) dx\) rapidly converges to 1, \(D_{KL}\)
converges to a constant value, even as \(H(X)\) continues to increase.


##### So what *is* the KL-Divergence?




## Mutual Information



# Things I want to show

- Differential entropy estimation ends up becoming (somewhat like) discrete entropy estimation
where we are trying to predict the alphabet used to generate the messages
- How, and why, K-nearest neighbors methods work
- Differential entropy is the volume of the support of the messages

# Differential Entropy

- 

# Estimating Entropy


# Mutual Information

<div id="plot"></div>
<script type="module">
import {get_mi_chart} from "./mi_charts.js";
let x = Array(500).fill(0).map((_) => Math.random());
let y = x.map((xi) => Math.sin(xi * 5) + Math.random() * 0.5);
get_mi_chart('plot', x.map((xi, i) => [xi, y[i]]), 3);
</script>



# Kullback-Leibler Divergence
