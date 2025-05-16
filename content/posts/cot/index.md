+++

draft = false
title = "A Brief History of Thinking"
date = "2025-04-04T11:35:00+12:00"
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

<link href="chat.css" rel="stylesheet" />
<link href="styles.css" rel="stylesheet" />
<link href="token.css" rel="stylesheet" />
<script src="diagram.js"></script>
<script src="chat.js"></script>
<script src="token.js"></script>


If you've been following recent developments in AI, you've probably heard of "simulated reasoning" models. Going by many names - OpenAI's o1, o3, and o4; Claude's "extended thinking mode"; Grok 3's "think" models; and perhaps most famously, DeepSeek's R1 model  - 
these models are ubiquitous, and might offer a path to greater capabilities that doesn't rely on purely scaling up 
models and datasets.


If you've never seen a reasoning model in action, go try one! (ChatGPT, for example, has a "reason" button for free users.) To give a taste, here's an example response from DeepSeek R1:


<div id="teaser-chat"></div>

<script>
makeChat("teaser-chat", [`What country is the 5th tallest mountain in?`,
`<i>&ltthink&gt</i> Okay, so I need to figure out which country has the fifth tallest mountain. Let me start by recalling the list of the highest mountains in the world. I know that the tallest is Mount Everest, which is in Nepal and China (Tibet). Then the second is K2 <b> ...[Truncated - this goes on for pages and pages.]<b>`
]);
</script>

Not only do these chains-of-thought look like thinking, they tend to improve model performance as well, letting these models top most [benchmarks for Math, Science, and Software Engineering.](https://artificialanalysis.ai/?models=o1%2Co3-mini%2Co1-preview%2Co1-mini%2Cgpt-4o-2024-08-06%2Cgpt-4o-2024-05-13%2Cgpt-4o%2Cgpt-4o-mini%2Co4-mini%2Cgpt-4-1%2Co3-mini-high%2Cgpt-4o-realtime-dec-2024%2Co3%2Cgpt-4-1-mini%2Co1-pro%2Cgpt-4o-mini-realtime-dec-2024%2Cgpt-4-1-nano%2Cgpt-4o-chatgpt-03-25%2Cgpt-4-5%2Cllama-3-3-instruct-70b%2Cqwen3-30b-a3b-instruct%2Cqwen3-235b-a22b-instruct%2Cqwen3-32b-instruct%2Cllama-3-1-instruct-405b%2Cllama-3-2-instruct-90b-vision%2Cllama-3-1-instruct-70b%2Cllama-3-2-instruct-11b-vision%2Cllama-3-1-instruct-8b%2Cllama-3-2-instruct-3b%2Cllama-3-2-instruct-1b%2Cllama-4-scout%2Cllama-4-maverick%2Cgemini-2-0-pro-experimental-02-05%2Cgemini-2-0-flash%2Cgemini-2-0-flash-experimental%2Cgemini-1-5-pro%2Cgemini-1-5-flash%2Cgemini-1-5-pro-may-2024%2Cgemma-2-27b%2Cgemma-2-9b%2Cgemini-1-5-flash-8b%2Cgemini-2-0-flash-thinking-exp-0121%2Cgemini-2-5-flash-reasoning%2Cgemini-2-5-pro%2Cgemini-2-0-flash-thinking-exp-1219%2Cclaude-35-sonnet%2Cclaude-3-7-sonnet-thinking%2Cclaude-3-7-sonnet%2Cdeepseek-r1%2Cdeepseek-r1-distill-llama-70b%2Cdeepseek-v3-0324%2Csonar%2Csonar-reasoning%2Cgrok-3-mini-reasoning%2Cgrok-3-reasoning%2Cgrok-3-mini-reasoning-low%2Cphi-3-medium%2Cllama-3-1-nemotron-instruct-70b%2Cllama-3-3-nemotron-super-49b%2Cllama-3-1-nemotron-ultra-253b-v1-reasoning%2Cgpt-4o-chatgpt%2Cdeepseek-v3#artificial-analysis-intelligence-index-by-model-type)

So, are we really seeing these AI models "thinking" out loud? Does reading the text between <i>\<think\></i> tags let us "read the mind" of an LLM?

The implications for AI safety are tantalising - perhaps we could audit models for misaligned goals or hidden biases just by reading their thought process as they make decisions. If a model was making a hiring decision based on protected characteristics,
perhaps it would tell us?. If a model was scheming against us, its thoughts
might lay bare the deception.

But are these chains-of-thought "real"? Can we trust them?

To answer this question, we first need to understand how simulated reasoning works, where it comes from, and why it helps model performance. 

Finally, we'll answer the question that's been on my mind since I first encountered these models: isn't it profoundly weird that an AI model just happens to think in human language?


## How does <i>\<think\></i>ing work?

> To understand how simulated reasoning models work, we first need a micro-primer on large language models (LLMs). If you already know this, skip to [#Faithful or Unfaithful?](#faithful-or-unfaithful)

Frontier LLMs use variants of the transformer architecture. To feed text into a model, we first split it into chunks of text called "tokens".

The sentence "The cat sat on the mat" might become
<i>The</i> <i> cat</i> <i> sat</i> <i> on</i> <i> the</i> <i> mat</i> <i>.</i>.

Next, we feed these tokens into the input of the transformer. 

<div id="flowchart2" style="width: 100%;"></div>

<script>
{
    const highlightConnections = addFlowchart("flowchart2", 5, ["The"], ["1970s"], 
            [1,1,1], false);

    function animate() {
        highlightConnections([1]);
        setTimeout(() => highlightConnections([1, 1]), 1000);
        setTimeout(() => highlightConnections([1, 1, 1]), 2000);
        setTimeout(() => highlightConnections([1, 1, 1, 1]), 3000);
        setTimeout(() => highlightConnections([1, 1, 1, 1, 1]), 4000);
        setTimeout(animate, 5000);
    }

    animate();
}
</script>

The information flows from left to right through the first layer,
the second layer, and so on. After the last layer, the model assigns probabilities to different tokens, and we pick the next 
token according to these probabilities. 

When we want to process a longer passage of text (e.g. "The cat sat"), 
we feed more tokens through the model.

<div id="flowchart_multi_serial" style="width: 100%;"></div>

<script>
{
let frame = 0;

const inputs = ["The", " cat", " sat"];
const cols = 5;
const highlighted = [];

const hc = addFlowchart("flowchart_multi_serial", cols, inputs, [" 1970s","hedral"," on"],
             [0], false, null, 

             (nodes, prevNodes) => {
                    let out = [new Array(Math.min(frame, cols)).fill(0), new Array(Math.min(frame, cols)).fill(Math.floor(frame / cols))];
                    out[1].splice(0, frame % cols, ...new Array(frame % cols).fill(Math.ceil(frame / cols)));
                    frame = (frame + 1) % (cols * inputs.length + 1);

                    return out;

            }
                 );

function animate() {
    hc(new Array(frame + 1).fill(0));
    setTimeout(animate, 500);
}

animate();
}
</script>

Later tokens (e.g. <i> sat</i>) can
look back at the intermediate results of earlier tokens (e.g. <i>The</i> or <i> cat</i>).

Notice also that we haven't made the **model** any bigger. Each of the 3 layers perform
the exact same number of calculations as before. What's changed is that later in the token sequence,
the model has access to more information - namely, previous calculations
from when the model was processing the earlier tokens.

Because of how the transformer is laid out, we don't actually need to calculate one token at a time. 
Instead, we can get exactly the same result by marching through all tokens in parallel. See if
you can convince yourself why this is the case. (Hint: look at where information can, and
cannot, flow.)

<div id="flowchart7" style="width: 100%;"></div>

<script>
{
    let frame = 0;
    function colLabels(nodes, prevNodes) {
        let out = [new Array(frame + 1).fill(0), new Array(frame + 1).fill(3)];

        frame = (frame + 1) % 5;

        return out;
    }

    const hc_2 = addFlowchart("flowchart7", 5, ["The"," cat"," sat"], [" 1970s","hedral"," on"],
                 [0], false, null, colLabels);

    function animate() {
        hc_2(new Array(frame + 1).fill(0));
        setTimeout(animate, 1000);
    }

    animate();
}
</script>
This parallelism is great for training because we can feed in long sequences of text all
at once and, in a single forward pass, process the whole thing.

To generate new text, we take the prediction at the last sequence position <i> on</i>, add it to 
the text sequence, and then run the model again on the new, longer sequence.

<div id="flowchart_gen" style="width: 100%;"></div>

<script>
{
    const cols = 5;
    let frame = 0;
    function colLabelsGen(nodes, prevNodes) {
        let out = [new Array(cols).fill(0), new Array(cols).fill(3)];
        out[1].splice(0, frame + 1, ...new Array(frame + 1).fill(4));


        frame = (frame + 1) % cols;

        return out;
    }

    const hc_gen = addFlowchart("flowchart_gen", cols, ["The"," cat"," sat", "on"], [" 1970s","hedral"," on", "the"],
                 [0,0,0,0,0], false, null, colLabelsGen);

    function animate() {
        hc_gen([0, 0, 0, 0, 0]);
        setTimeout(animate, 1000);
    }

    animate();
}
</script>

Even though we've already processed the first 3 tokens, 
information still only flows downwards and rightwards. 

The transformer doesn't distinguish between text fed into it or generated by it, 
and so it must be able to process the sequence identically - whether we add one token
at a time like above, or process it fully in parallel, like below:

<div id="flowchart_gen_parallel" style="width: 100%;"></div>

<script>
{
    let frame = 0;
    let cols = 5;
    function colLabels(nodes, prevNodes) {
        let out = [new Array(frame + 1).fill(0), new Array(frame + 1).fill(4)];

        frame = (frame + 1) % 5;

        return out;
    }


    const hc_gen = addFlowchart("flowchart_gen_parallel", cols, ["The"," cat"," sat", "on"], [" 1970s","hedral"," on", "the"],
                 [0], false, null, colLabels);

   function animate() {
        hc_gen(new Array(frame + 1).fill(0));
        setTimeout(animate, 1000);
    }

   animate();
}
</script>

With me so far? Great!

## Faithful or Unfaithful

Our little diversion into the transformer made one fact clear: adding more
tokens lets the transformer do more processing. If we triple the tokens
fed into the model, the model does three times the work. 

It's tempting to imagine this as the explanation for why simulated 
reasoning improves performance. 
We know from [scaling laws](https://arxiv.org/pdf/2001.08361) that we can improve
performance by making models bigger and/or training them on more data. 
Perhaps letting a constant-sized model think for longer
works similarly?

Taken to its extreme conclusion, the *test-time compute hypothesis* might suggest
that chain-of-thought content does not matter at all, and that we merely
need to allocate extra compute when generating an answer (test-time) by letting
the model generate extra tokens.

This gives us hypothesis A:
the *content* of reasoning does not matter at all. 

The other extreme - that the specific choice of every token in the
chain-of-thought is crucially
important to performance - gives us hypothesis B. 

If hypothesis A were true, we could replace the reasoning trace with the word
"Ummm" over and over, or "...", or gibberish, without losing any performance.
If hypothesis B were correct, on the other hand, the final answer ultimately
output by the model **must** depend on all the steps presented in the
chain-of-thought, such that modifying any intermediate step modifies the
conclusion (provided the model doesn't notice the modification and correct the
chain.) 

(*Note that hypothesis B doesn't preclude the model from encoding a secret
message in what otherwise looks like natural language.* It does mean,
however, that the final answer must depend on this secret message.)

Research to date can rule out *both* hypotheses from being completely true, at least for most models across most problem types. 
Thus, we should expect real-world situations to lie somewhere inbetween.

Even moreso, hypotheses A and B both apply for certain *kinds* of computation. 
Hypothesis A can apply if the problem is highly parallelizable, and hypothesis B
if the problem is highly sequential.

To understand why, and to see how simulated reasoning resolves a fairly severe information bottleneck endemic to transformers, we need
to dive back in to the transformer architecture.

### Reasoning as Information Flow

Let's imagine a very simple model, solving a very straightforward task. This model
is a transformer with only one layer. It can read in simple maths equations and predict the
next token - in fact, it's been trained the same way large language models are, only on a
smaller set of text. 

Specifically, we train it on multiplication modulo *n* - that is, multiplication
with a set of numbers that wraps around to 0 once it reaches *n*. (In this
example, n = 61).

We give our model lots of examples of equations, including things like vectors:

"4 * 5 = 20"


"12 * 21 = 8"

"20 * 41 * 23 = 11"
 
"(56, 60) * (34, 46) = (13, 15)"

etc.

Token by token, the model reads in the training data and tries to predict the next token.
From this, it develops an understanding of how these questions are structured and,
ultimately, how to actually calculate multiplication (mod n).

Our model's single layer is very small - let's say that it can only perform multiplication between
two numbers at a time, and nothing more.

For example, we could ask it what 1 * 1 is:

<div id="flowchart_facile" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile", 3, ["1", "*", "1", "="], 
                              ["*", "9", "=", "1"], [3, 3, 4], false, 
                              {
                               "1,2": "1",
                               "1,3": "1",
                              }, calcColBoundsSnake, true);
</script>

Note how the layer could compute the product as soon as it read (1 * 1). However, because
the model is a next-token predictor, it didn't do anything with this information, and 
instead predicted "=". Once the model was asked to return its answer, it recomputed the sum
and correctly predicted "1".

What about a more complicated equation? Well, there are two kinds of complications: parallel
and serial.

We can easily calculate something more complex, provided it's parallelizable. For example,
we could add multiply (elementwise) two vectors of numbers:

"(1, 2) * (3, 4) = (1 * 3, 2 * 4)".

<div id="flowchart_vector" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_vector", 3, ["(1,", "2)", "*", "(3,", "4)", "=",], 
                              ["", "", "", "", "=", "(3,"], 
                              [6, 6, 6], false, 
                              {
                               "1,5": "3",
                              });
</script>

Even though the model can't calculate the whole vector sum at once, it can
calculate the first multiplication (1 * 3 = 3) without knowing any of the other
calculations. If we keep generating (passing the predicted token
into the input tokens), the model can chug through this calculation without
a problem.

<div id="flowchart_vector_2" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_vector_2", 3, ["(1,", "2)", "*", "(3,", "4)", "=", "(3,"], 
                              ["", "", "", "", "=", "(3,", "8)"], 
                              [7, 7, 7], false, 
                              {
                               "1,5": "3",
                               "1,6": "8",
                              }, calcColBoundsSnake, true);
</script>


This example involved calculating multiplication twice, and was trivially easy. Compare that
to calculating "1 * 2 * 3". Again, we have two additions. Yet this task is impossible
for our model.

<div id="flowchart_facile_serial" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial", 3, ["1", "*", "2", "*", "3", "="], 
                              ["", "", "=", "", "=", "9?"], 
                              [6, 6, 6], false, 
                              {
                               "1,2": "2",
                               "1,5": "(??)",
                              }, calcColBoundsTriangle,
                              false);
</script>

Why is this impossible? After all, once the model had seen (1 * 2), it calculated (= 2), no problem.
However, this information is locked away, inaccessible to the last token's calculator.
In the last token position, the model doesn't have the ability to do something too hard (calculating
the sum of 3 numbers) in a single step. Plus, it doesn't have a way of retrieving the earlier calculation
it performed. So, all that's left is to guess.

One way to solve this problem would be to give the model more layers. That way, earlier computations can
pass information to later ones.

<div id="flowchart_facile_serial2" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial2", 4, ["1", "*", "2", "*", "3", "="], 
                              ["", "", "=", "", "=", "6"], 
                              [3, 3, 4, 6], false, 
                              {
                               "1,2": "2",
                               "2,4": "6",
                               "2,5": "6",
                              },
                              calcColBoundsTriangle);
</script>

In the first layer, any of the highlighted positions has enough information to 
calculate (1 * 2). The model could choose to do this sum in any or all
of these positions, and it would still succeed at its task. 

For example, it might wait to calculate (1 * 2) until the "=" token, which
would look like this:

<div id="flowchart_facile_serial3" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial3", 4, ["1", "*", "2", "*", "3", "="], 
                              ["", "", "=", "", "=", "6"], 
                              [6, 6, 6, 6], false, 
                              {
                               "1,5": "2",
                               "2,5": "6",
                              },
                              calcColBoundsTriangle);
</script>

In the second layer, once the model has seen the full equation it accesses
the result from the previous layer, and can easily calculate 2 * 3 = 6.

However, we can completely stump our new, larger model merely by adding one more
term - e.g. 

"1 * 2 * 3 * 4 ="

<div id="flowchart_tokenized" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_tokenized", 4, ["1", "*", "2", "*", "3", "*", "4", "="], 
                              ["",  "", "=", "", "=", "", "", "??"], 
                              [3, 3, 3, 8], false, 
                              {"1,2": "2",
                              "1,3": "2",
                              "1,4": "2",
                              "1,5": "2",
                              "1,6": "2",
                              "1,7": "2",
                               "2,4": "6",
                               "2,5": "6",
                               "2,6": "6",
                               "2,7": "6",
                               },
                               calcColBoundsTriangle);
</script>


Even though the model can compute 

1 * 2 = 2

and 

2 * 3 = 6

it has no way of passing the intermediate result (6) to the next few tokens. 
So, 

6 * 4 = ?

never gets calculated, and the
model has to guess once again.

Crucially, the model is not compute limited - rather, it's bottlenecked
by **information flow**. 

#### Why reasoning helps
We can easily teach our single-layer model to solve problems that stump our two layer 
model. A fairly natural way to do this is **simulated reasoning**. 

With some additional training, we teach our model to generate
intermediate tokens that move results out of the inaccessible latent stream of the model
and into the model's context.


<div id="flowchart_reason" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason", 3, ["1", "*", "2", "*", "3", "="], 
                              ["", "", "", "", "", "&ltthink&gt"], 
                              [6, 6, 6], false, 
                              {
                              },
                               calcColBoundsTriangle, true);
</script>

Instead of answering right away, the model indicates it wants to spend some time "thinking".


<div id="flowchart_reason2" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason2", 3, ["&ltthink&gt", "1", "*", "2", "="], 
                              ["1", "*", "2", "=", "2"], 
                              [5, 5, 5], false, 
                              {
                                "1,3": "2",
                                "1,4": "2",
                              },
                               calcColBoundsTriangle, true);
</script>

Here, the model copies the first part of the equation, and solves it. Now that it's in
thinking mode, it gets to write this result directly into the context and read it back in as the next input
token, giving all calculations on subsequent tokens access. 

Note that it hasn't had to learn much new grammar to do this.

<div id="flowchart_reason3" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason3", 3, ["=", "2", ",", "2", "*", "3", "=", "6"], 
                              ["2", ",", "2", "*", "3", "=", "6", "&lt/think&gt"], 
                              [8, 8, 8], false, 
                              {
                                "1,0": "2", 
                                "1,5": "6",
                                "1,6": "6",
                              },
                               calcColBoundsTriangle, true);
</script>

Now, the model gets to calculate 2 * 3 instead of (1 * 2) * 3. It does so easily, and
writes the answer into the context stream. Finally, it emits a `</think>` token
to signal the end of thinking mode.

The full sequence looks like:
<div id="reason-chat"></div>
<script>
makeChat("reason-chat", ["1 * 2 * 3 = ",
"&ltthink&gt \n1 * 2 = 2, \n2 * 3 = 6 \n&lt/think&gt \n\n 6"]);
</script>

### That's it?

Without needing to philosophize about whether a model was truly "thinking" or "reasoning", 
we have a clear example of where "reasoning" can improve performance. 
When we let the model write out intermediate results,
it can re-use its existing machinery, and solve problems that would otherwise be impossible.

Because our model is so simple, it has no choice but to make the chain-of-thought
faithful for this problem. We could intervene on its <i>\<think\></i>-ing and change
the answer, such as by setting:

"1 * 2 = 3"

The model would compute (3 * 3 = 9) and answer 9
(provided it didn't detect the issue and start over).

<div id="reason-chat-intervention"></div>
<script>
makeChat("reason-chat-intervention", ["1 * 2 * 3 = ",
"&ltthink&gt \n1 * 2 = <b><u>3</u></b>, \n3 * 3 = 9 \n&lt/think&gt \n\n 9"]);
</script>

However, if we gave the model a question that was too simple, there's no longer a guarantee
its final answer will be influenced by the chain-of-thought. When we intervene
again, the model could answer
by referring to its chain-of-thought, or it could just recalculate (1 * 2) on the fly without
telling us.

<div id="reason-chat-intervention-simple"></div>
<script>
makeChat("reason-chat-intervention-simple", ["1 * 2 = ",
"&ltthink&gt \n1 * 2 = <b><u>3</u></b>\n&lt/think&gt \n\n 2"]);
</script>

In the right circumstances, then, chains-of-thought could give us insight
into what the model is doing. It depends on how the model is using them.

There are obvious and subtle reasons this works.
First and foremost, letting the model write intermediate results clearly lets it move information
in ways otherwise impossible.
However, even in our
minimal example, there's more than just information movement going on. 

Consider the \<think\> 
token - we explicitly trained the model that text between 
\<think\> and \</think\> tags would not be considered part of its answer. Thus, after
emitting and reading in a \<think\> token, the model enters a different mode, allowing
it to output tokens that don't directly answer the question, but instead work through it, 
step-by-step. There are subtle uses for this self-programming, particularly for larger models with a wider vocabulary. For example, if the model wasn't sure of its working and wanted to 
backtrack, perhaps it might learn to emit the word "wait".

From this minimal model, then, we've seen two ways that chain-of-thought reasoning *can*
allow models greater capability: through communication, and through coordination. A model
can *communicate* results that are otherwise inaccessible to itself in the future,
and a model can *coordinate* by choosing what mode it wants to be in.

Real models are, of course, vastly more complicated than our little one-layer model. Let's scale up, and see if our intuition holds.

## Critical Path

Play around with the following interactive diagram!

This represents all possible information flows in the model for a sequence of filler
tokens that don't convey any information extra information. This technically
gives the model access to more compute, but doesn't let it write intermediate tokens. 

<div id="flowchart_critpath" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_critpath", 7, ["", "", "", "", "", "", ""], 
                              ["", "", "", "", "", "", ""], 
                              [1,2,4,5,6,7,7], true, 
                              {
                               },
                               calcColBoundsSnake);
</script>

We are drawing what we might call the critical path. In each layer (each vertical slice),
the model can choose to parallelize the problem as 
much as it needs to. But if the model needs 5 parallel tokens to calculate a result,
the subsequent layer can only collect that result after those 5 tokens.

Any grey nodes above the critical path don't have enough information yet to get started, and
so are irrelevant to this chain of decisions. These nodes have to guess, or work on something else.
Any grey nodes below the critical path don't add any extra information to the 
chain of decisions, and so likewise are irrelevant.

The model has a lot of freedom to parallelize problems that might be tricky.
Research shows that when problems are highly parallelizable, 
transformers can indeed [learn to solve them using only
filler tokens.](https://arxiv.org/pdf/2404.15758v1)

But even when a model has many tokens worth of compute to play with, it can't actually make very many linked
decisions.

The most important takeaway is this: the **depth of the critical path is constant**,
regardless of how many *filler* tokens are added.
Each calculation can be split across more tokens and parallelized, but only 
a finite number of decisions can depend on each other. 

However, if we let the model pass information back to itself using a chain-of-thought,
we unlock much greater logical depth. Research also confirms this: letting
models produce intermediate steps [drastically increases their capabilities when
solving serial problems.](https://arxiv.org/pdf/2402.12875)

Practically, this means that models *don't need* chain-of-thought tokens to hold meaning 
for simple or parallelizable problems, and *do* need it for highly serial problems. 

This explains the counterintuitive finding that, for a given problem, [larger models often produce
less faithful chains-of-thought than smaller models.](https://arxiv.org/pdf/2307.13702)


# Where does reasoning come from?

In the [previous section](#why-reasoning-helps), we saw that letting our model
output a grammar similar(ish) to human reasoning allowed it to improve
performance. But where do real models learn this skill?

It helps to remember how LLMs are trained. First, they are *pretrained* on huge amounts of data, large
portions of which is natural human language.
This exposes them to countless patterns, facts, ways of speaking, etc.
Modelling this accurately requires detecting and replicating patterns found in the dataset. 

Chain-of-thought is one such pattern. Think of textbooks, or solutions to exams, or forums
discussing approaches to solving a logic puzzle. Being able to write the subset of
natural language that produces "logic speak" would be a boon for an LLM, just
like detecting and writing python code would be.

Furthermore, these chains-of-thought often serve as a bridge between an initial
question 
and a logical process that breaks the problem into simpler
subproblems, groups relevant information, stores results of intermediate calculations, 
etc. (see [Madaan & Yazdanbakhsh).](https://arxiv.org/pdf/2209.07686)

Early work fed LLMs example chains-of-thought alongside exam-style problems to see if 
getting the model to copy this format allowed it to perform better. Surprisingly enough,
[it did!](https://arxiv.org/abs/2201.11903)

Later work found that models as early as GPT-3 didn't even need examples - they could be 
encouraged to produce chains-of-thought simply by inserting the phrase 
["Let's think step-by-step"](https://arxiv.org/pdf/2205.11916)
before their answer.

<div id="chat C"></div>

<script>
makeChat("chat C", [`Q: A juggler can juggle 16 balls. Half of the balls are golf balls, \
and half of the golf balls are blue. How many blue golf balls are \
there?

A: Let’s think step by step.`,
`There are 16 balls in total. Half of the balls are golf \
balls. That means that there are 8 golf balls. Half of the golf balls \
are blue. That means that there are 4 blue golf balls.
`]);
</script>

So, we can be fairly sure the patterns used by reasoning models, or at least a close precursor, exists in,
and was learnt from, the training data. 
The real surprise was that chains-of-thought could improve performance on downstream
tasks. 

From the previous section, we now have an idea of why this is - communication and coordination. 

This doesn't fully explain why
**reasoning** models appear to use this technique, however. 

What sets reasoning models apart is their training regime - typically, the use
of **reinforcement learning** after initial pre-training.

[Reinforcement learning](http://www.incompleteideas.net/book/RLbook2020.pdf) 
is very different to the approach used for pretraining.
For one, it is goal-driven: models are rewarded based on some criteria, like
picking the correct answer to a question, or producing a response that humans 
rate highly. In a multiple choice setting, for example, the model might only be rated on
which choice it selects as its final answer.

Also, in RL, models are allowed to "explore" by interacting with their environment.
For text-predictors, this means they are free to start producing text 
unlike any they were trained on. Because they are only rated based on
their final answer, they are (by default) free to come up with unique ways of
solving problems. If the approach works, they are rewarded and will learn to use
it more often.

In the previous section, we taught a tiny model to solve problems beyond its capabilities by
writing to, and reading from, its token context. We assumed the model would structure its
reasoning into a form that makes sense to us. But why would it? It's not impossible
to imagine the model doing something like this:

<div id="reason-chat-steganography"></div>
<script>
makeChat("reason-chat-steganography", ["1 * 2 * 3 = ",
"&ltthink&gt  .#振%^^^ &&lt/think&gt \n\n 6"]);
</script>

There are a few reasons we don't see this behaviour. Firstly and most simply, exploitation: if a
model has already learnt a technique that works (e.g. chain-of-thought using human
language), it doesn't initially have much incentive to modify it. Making the
chain-of-thought longer often improves performance, and so models trained with
RL often generate very long chains-of-thought (see
[Deepseek-AI](https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf);
but also [Liu et. al).](https://arxiv.org/pdf/2503.20783)

Secondly, some RL regimes restrict the model from straying too far from its base
pre-trained self. A prime example is the use of the KL divergence between an RL
model and its pretrained base model. Here, the model is lightly penalized 
for pruning its responses to a subset of the base model's, but heavily penalized for producing 
a sequence the base model would be unlikely to produce. In other words, as the RL model
explores new ways of answering a question, it can prune its outputs to
a subset of what the base model might answer, but punished if it strays too far
from something the original model might produce. KL divergence is generally
intended to prevent a model "unlearning" useful tools as it is trained.
However, this term is also an explicit selection
pressure which guides model training away from completely novel (read:
unintelligible) solutions.


Finally, there are implicit selection biases at play. DeepSeek R1 might have
taken the world by storm, but before R1, there was
[R1-Zero.](https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf)
R1-Zero was
post-trained entirely using reinforcement learning, and learned to reason by
mixing languages and producing sometimes incoherent chains-of-thought. As such,
it was effectively sidelined and never saw broad adoption. Instead, R1 was
trained more explicitly to produce human-interpretable reasoning chains. These
implicit selection biases are at least some of the reason why models reason the
way they do: because that's what we want them to do, and so we discard training
regimes and models that don't meet this criteria.

Examples of reasoning models that aren't human interpretable include [Coconut,
implicit CoT, etc.] There is a bit of a backlash against them [links]



So, to summarise:
- Large language models learn to detect and reproduce structures and patterns in text.
- One pattern they learn to produce is the "chain-of-thought", where a problem is broken down step-by-step.
- For some problems, applying this pattern allows the model to break down and solve simpler subproblems.
- When this is the case, chain-of-thought can dramatically improve performance.


# Experiments

Given what we've seen, it can be hard to know how seriously to take a chain-of-thought. In an ideal world,
a model's reasoning would be an accurate representation of how it arrived at an answer. The reality appears
more complicated. 

One approach is looking below the surface of the model and reading it's internal state. In particular,
we can try and read out when the model actually choose its final answer.

Why is this an interesting question to ask?

- We want to be able to trust a model's chain of thought. Having (accurate) human-readable text describing what a model
is doing and why is basically the gold standard for AI Safety.

- If we want to review a model's reasoning, we don't want to wade through paragraphs of post-hoc justification.
- We want to know whether/to what degree we can trust a model's chain of thought to explain how it has made
its choices. If some/all of its working has no impact on the final answer, we can safely ignore this reasoning.
- It's possible a model could come up with an initial guess, and then use later reasoning to refine this estimate.


## The experiment

To explore these questions, I trained a series of probes.

These probes had access to the internal activations of a reasoning model as it answered multiple choice questions.

The probes had a simple objective: guess what answer the model was going to produce, as early as they could.

In particular, the training objective was to minimize cross entropy between the probe's predicted answer,
and the labels the model produced after all its reasoning.

I used multiple choice because this gave the probes a very simple target - each text sequence could easily (*cough*)
be classified as 1 of 10 answers. The dataset was balanced, too, meaning that a probe couldn't just predict the relative
statistics of each answer. 

Why might this work? Well, we should expect it to work late in the sequence - this is pretty similar to unembedding,
the process the transformer uses to turn its internal residual stream into a prediction for the next token. 

As we get further away from the final answer, however, we should expect the probe to become less confident. 
If a model made up its mind early and was just storing its answer in the residual stream, waiting to finish its
"reasoning", then we should probably expect a probe to be able to find that. 

Conversely, if the model was really using all the computation it could for each and every token, then perhaps it should
be quite difficult to probe its internals. 



It's important not to be too prescriptivist about what the results may (or may not) tell us. There are a series of 
alternate possibilities, from least likely to most.

Least likely: the probe learns to accurately mimic what the reasoning model will do. (For very small probes, 
this mimicry might actually still be informative. After all, if the reasoning model behaves extremely predictably,
that tells us something.)

More likely: the probe learns a shortcut and can process a model's intermediate conclusions more effectively than the model itself.
I.e. even if the probe can guess what a model will say well before the model says it, that doesn't prove the model didn't use
those extra tokens for some processing.

Even more likely: the probe learns some heuristics that let it probabilistically guess the model's final answer, even if
it doesn't always get it perfectly right.

Most likely: the model memorises the questions (mostly eliminated by not training on the validation set).

<div id="visualizer1"></div>

<script src="script.js"></script>
<script>
    // Initialize visualizer with MLP data when page loads
    document.addEventListener('DOMContentLoaded', function() {
        create_visualizer('tf.json', 'visualizer1');
    });
</script>

