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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">

Information theory - and in particular, entropy - can be quite an intimidating topic.
It doesn't have to be. If you can develop some key intuitions for the topic, you can
learn and use entropy!

So let's dive right in... by playing the lottery!

Each round, you get to pick one number on the ticket below:

<div style="width: 100%; margin: auto;  margin-top: -80px; margin-bottom: -200px;">
    <object id="ticket" type="image/svg+xml" data="lottery_ticket.svg" height="500px"></object>
    <div id="ticket numbers" style="position: relative; top: -275px; left: 86px; 
        width: 202px; height: 182px; display: flex; flex-wrap: wrap;"></div>
</div>

Once you've picked the number, you can get the results of 
the lottery on the machine below. 

There are two possible outcomes,
and so I only need to send you a single *bit* of information:

- 1, if your ticket is a winner,
- 0, otherwise

It's tiiiiiimmmmmme to play the lottery! Each press of the button below
will pick a new random number, and give you the results.

<object id="machine" type="image/svg+xml" data="lottery_machine.svg" style="margin-bottom: -80px"></object>
<script src="./lottery.js"></script>

Did you win? 

Chances are, you didn't. You can keep playing until you do, but be warned,
it might take a while.

It might seem each time you played, I would send you the same amount of information - either you won or you lost,
and both times you learned a single bit of information.

*But that's not the case.* To see why, let's modify the game slightly. This time,
I want you to tell me **the winning number** for each round. 
Is this possible? Most of the time - no. If your ticket lost, you can eliminate
1 of the 20 numbers, but there's still 19 to pick from!

**However**, if you **won**, you immediately know which number was picked. More 
than that, you also know all the 19 numbers that weren't picked!

The key intuition for understanding entropy is exactly this: the **more likely** a piece of information
is, the **less information** it carries. Formally, we define Information Content, sometimes called *surprisal*, as \(\frac{1}{P}\),
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

So why do we take the log? Because it takes the set of things we've learned, and 
converts it into the bits of information we'd need to represent them.

In our winning ticket example, the information content of our winning ticket is:

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
into a single bit message. Of course, this isn't the case.

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
H(\text{Lottery}) = -P(\text{win}) \log_2{P(\text{win})} - P(\text{lose}) \log_2{P(\text{lose})}
\]

We know that \(P(\text{win}) = \frac{1}{20}\) and \(P(\text{lose}) = \frac{19}{20}\), so 
the entropy of the set of messages we could receive is:

\[
\begin{align}
            H(\text{Lottery}) &= -\frac{1}{20} \log_2\left(\frac{1}{20}\right) 
            -\frac{19}{20}\log_2\left(\frac{19}{20}\right) \\
                              &\approx 0.216... + 0.070... \\
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

*(It's called the Pigeonhole principle because if you have **n** pigeonholes, you can't put **n+1** pigeons
in them without putting at least two pigeons in the same hole. In our case, if we only have 2 messages
and 20 possible winning numbers, 19 of our numbers end up in one kind of message, and only one ends up in the other.)*
