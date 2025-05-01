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

The era of "thinking" or "reasoning" models is upon us. If you haven't seen them before, watching a reasoning model
answer a question can be quite a spooky experience. Before producing their final answer, these models will write out a "chain of thought" - sometimes hundreds or thousands of words long. These chains of thought look a lot like the internal monologue you or I might have while thinking through a problem.

<div id="teaser-chat"></div>

<script>
makeChat("teaser-chat", [`What country is the 5th tallest mountain in?`,
`&ltthink&gt Okay, so I need to figure out which country has the fifth tallest mountain. Let me start by recalling the list of the highest mountains in the world. I know that the tallest is Mount Everest, which is in Nepal and China (Tibet). Then the second is K...`
]);
</script>

Not only do these chains-of-thought look like thinking, they tend to improve model performance as well. OpenAI's O-family (O1, O3, and O4) are reasoning models, and DeepSeek's R1 is also a reasoning model. These models top most benchmarks, not just for Math, Science, and Software Engineering, but for everyday tasks as well. 

But **why** do they work? Specifically,

1. Why do models "reason" in natural language?
2. Why does this tend to improve performance?
3. Is this reasoning a true representation of the model's underlying "thought" process?


## How does <i>\<think\></i>ing work?

To understand reasoning, we need a little background on how language models work.
The most popular architecture for these models are variants of the transformer, which works like this:

<i>The</i>

First, we split our text into chunks (called tokens). The sentence "The cat sat on the mat" might become
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

Here, layers go from left to right. The first layer can only 
read in a representation of the input token. The second layer can
read this, plus the output of the first layer. The third layer can
read the input token, the first layer's output, and the second layer's
output (and so on.)

After all the layers, the model predicts the next token.
It does this by giving different probability scores for all possible tokens. In our
example, we just take the token associated with the highest probability.

When we want to process a longer passage of text (e.g. "The cat sat"), 
we split the sentence into tokens and 
run them through the model.

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

Now that we have multiple tokens, notice how later tokens (e.g. <i> sat</i>) can
look back at the intermediate results of earlier tokens (e.g. <i>The</i> or <i> cat</i>).

Notice also that we haven't made the **model** any bigger. Each of the 3 layers perform
the exact same calculations as before. What's changed is that later in the token sequence,
the model has access to more information.

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

To generate new text, we take the prediction at the last sequence position (<i> on</i>) and add it to 
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

Note again that even though we've already calculated all layers for the first 3 tokens, 
as we pass the 4th token through the model, each layer can only access information from
earlier layers (i.e. to the left of the current layer). 

The transformer doesn't distinguish between text fed into it or generated by it, 
and so it must be able to process the sequence identically whether we add one token
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

## Where reasoning comes from (maybe)

Large Language Models (LLMs) learn by
ingesting huge quantities of text, typically scraped from the internet. These models
are shown a chunk of text, and scored on how well they predict that same chunk of text,
shifted by one word. That is, 

<i>The</i> <i> cat</i> <i> sat</i> <i> on</i> <i> the</i> 

might be scored based on whether
it correctly predicts the sequence 

<i> cat</i> <i> sat</i> <i> on</i> <i> the</i> <i> mat</i>

Through this process, LLMs learn how to detect and replicate structures and patterns. Sometimes,
fairly sophisticated capabilities emerge. So-called "in-context learning" is one such example. 
In essence, in-context learning is where showing a model examples beforehand allows it to
better stay on task or produce more accurate results. 
Despite potentially never having encountered the exact structure in its training data, 
the model appears to adapt its outputs to better replicate the style or
structure of the examples given.

For a concrete demonstration, let's imagine we want a model to read a sentence describing items we want to buy,
and format it into a nice list. This model hasn't been trained to follow instructions, and instead 
just predicts the next token as best it can.

We could ask the model directly, but we'll probably get back some nonsense:

<div id="chat A"></div>

<script>
makeChat("chat A", [`Format this sentence into a python grocery list of strings. 

I want some bananas, a can of beans, and some coffee.`,
`User 0: # grocery_list = "I want some bananas, a can of beans, and some coffee."

 grocery_list = "I want some bananas, a can of beans, and some coffee."
 print(grocery_list)
 \# grocery_list = "I want some bananas, a can of beans, and some coffee."
 grocery_list = "I want some bananas,`
          ]);
</script>


Instead, if we give concrete examples, we're much more likely to get a good result:

<div id="chat B"></div>

<script>
makeChat("chat B", [`Format this sentence into a python grocery list of strings. 

    Sentence:
    I want a bagel and some cream cheese.

    List:
    ["bagel", "cream cheese"]

    Sentence:
    I want some bananas, a can of beans, and some coffee.
    
    List:`,
` ["bananas", "can of beans", "coffee"]`
]);
</script>

This ability - in-context learning - is a very useful tool for models to have in their
toolkit.

It might emerge during training because there are many patterns in the training data that
are both *rare* and appear in *clusters* (see [Chan et. al](https://arxiv.org/pdf/2205.05055)). 

For example, a clump of python code probably implies more python nearby.
One or two worked math examples mean the model could be training on a textbook, or perhaps some exam solutions,
and therefore might not need to worry about writing slam poetry.

Being able to detect patterns in structure and style, and constrain generated text to mimic these patterns,
lets models predict text within the training data much more accurately. Models appear to learn
circuitry that enables, or at the very least [emerges alongside,](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) 
this kind of pattern matching, and suggests this capability is more complex than mere regurgiation
of already-seen patterns.


But back to reasoning! Early on, [researchers used in-context learning](https://arxiv.org/pdf/2201.11903)
to get models to produce chains-of-thought when solving difficult maths problems, word problems, 
"common sense" questions, etc. These tests seemed to show across-the-board improvements, given
the language model was sufficiently large.

As to their justification for using chain-of-thought in the first place, it ranged from the anthropomorphic
(

At this point, the answer to the question "why do models reason in natural language" was obvious:
they reason in natural language because they were directly told to do so, and were given structured
examples from which to copy the patterns. Even at this point, however, questions emerge: is structured
reasoning just another domain-specific language or format that can be learned like JSON or XML? 
Furthermore, are models really learning from the short examples provided, or using the examples to lock
into patterns they had already learned?

[Later work suggests the latter explanation,](https://arxiv.org/pdf/2205.11916)
finding that models as early as GPT-3 could be encouraged into this mode of 
operation by simply inserting "Let's think step-by-step" into the beginning of the answer.

<div id="chat C"></div>

<script>
makeChat("chat C", [`Q: A juggler can juggle 16 balls. Half of the balls are golf balls, \
and half of the golf balls are blue. How many blue golf balls are \
there?

A: Let’s think step by step`,
`There are 16 balls in total. Half of the balls are golf \
balls. That means that there are 8 golf balls. Half of the golf balls \
are blue. That means that there are 4 blue golf balls.
`]);
</script>

The most suprising outcome of all this work is, of course, that reasoning appears to greatly increase
model's capacity to work through difficult problems. 

But why?

## Why reasoning (sometimes) works

- steganography?
- test-time compute?
- 

Producing a chain of thought involves generating a lot of tokens. Furthermore, we know that generating each token in a typical
Transformer requires the same amount of compute as any other token. It can be tempting, then, to simply assume that 
giving a model more tokens scales up the amount of compute, that more compute = more better, and leave it at that.

There's a few issues with this approach, though.

First, why do models need to bother "reasoning" at all? Why not some other learned strategy, such as repeating
"umm" over and over?
    - first, because we trained them that way
    - second, because of information movement


Let's consider a simple transformer with only one layer. This layer is fairly simple - imagine 
it perform a maths operation
(addition, subtraction, multiplication, etc.) on two numbers, but nothing more.

For example, we could ask it what 1 + 1 is:

<div id="flowchart_facile" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile", 3, ["1", "+", "1", "="], 
                              ["", "", "=", "2"], [3, 3, 4], false, 
                              {
                               "1,2": "2",
                               "1,3": "2",
                              }, calcColBoundsSnake, true);
</script>

Note how the layer could compute the sum as soon as it read (1 + 1). However, because
the model is a next-token predictor, it didn't do anything with this information, and 
instead predicted "=". Once the model was asked to return its answer, it recomputed the sum
and correctly predicted "2".

What about a more complicated equation? Well, there are two kinds of complications: parallel
and serial.

We can easily calculate something more complex, provided it's parallelizable. For example,
we could add two vectors of numbers:

"(1, 2) + (3, 4) = (1 + 3, 2 + 4)".

<div id="flowchart_vector" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_vector", 3, ["(1,", "2)", "+", "(3,", "4)", "=",], 
                              ["", "", "", "", "=", "(4,"], 
                              [6, 6, 6], false, 
                              {
                               "1,5": "4",
                              });
</script>

Even though the model can't calculate the whole vector sum at once, it can
calculate the first addition (1 + 3 = 4) without knowing any of the other
calculations. If we keep generating (passing the predicted token
into the input tokens), the model can chug through this calculation without
a problem.

<div id="flowchart_vector_2" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_vector_2", 3, ["[1,", "2]", "+", "[3,", "4]", "=", "[4,"], 
                              ["", "", "", "", "=", "[4,", "6]"], 
                              [7, 7, 7], false, 
                              {
                               "1,5": "4",
                               "1,6": "6",
                              });
</script>


This example involved calculating addition twice, and was trivially easy. Compare that
to calculating "1 + 2 + 3". Again, we have two additions. Yet this task is impossible
for our model.

<div id="flowchart_facile_serial" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial", 3, ["1", "+", "2", "+", "3", "="], 
                              ["", "", "=", "", "=", "???"], 
                              [6, 6, 6], false, 
                              {
                               "1,2": "3",
                               "1,5": "(??)",
                              }, calcColBoundsTriangle,
                              false);
</script>

Why is this impossible? After all, once the model had seen (1 + 2), it calculated (= 3), no problem.
However, this information is locked away, inaccessible to the last token's calculator.
In the last token position, the model doesn't have the ability to do something too hard (calculating
the sum of 3 numbers) in a single step. Plus, it doesn't have a way of retrieving the earlier calculation
it performed. So, all that's left is to guess.

One way to solve this problem would be to give the model more layers. That way, earlier computations can
pass information to later ones.

<div id="flowchart_facile_serial2" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial2", 4, ["1", "+", "2", "+", "3", "="], 
                              ["", "", "=", "", "=", "6"], 
                              [3, 3, 4, 6], false, 
                              {
                               "1,2": "3",
                               "2,4": "6",
                               "2,5": "6",
                              },
                              calcColBoundsTriangle);
</script>

In the first layer, any of the highlighted positions has enough information to 
calculate the sum (1 + 2). The model could choose to do this sum in any or all
of these positions, and it would still succeed at its task. 

For example, it might wait to calculate (1+2) until the "=" token, which
would look like this:

<div id="flowchart_facile_serial3" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial3", 4, ["1", "+", "2", "+", "3", "="], 
                              ["", "", "=", "", "=", "6"], 
                              [6, 6, 6, 6], false, 
                              {
                               "1,5": "3",
                               "2,5": "6",
                              },
                              calcColBoundsTriangle);
</script>

In the second layer, once the model has seen the full equation (... + 3), it accesses
the result from the previous layer, and can easily calculate 3 + 3 = 6.

However, we can completely stump our new, larger model merely by adding one more
term - e.g. 

"1 + 2 + 3 + 4 ="


<div id="flowchart3" style="width: 100%;"></div>

<script>
addFlowchart("flowchart3", 4, ["1 + 2", "+ 3", "+ 4", "="], 
                              ["",  "",  "=",  "??"], 
                              [1, 2, 2, 4], false, 
                              {"1,0": "3",
                               "2,1": "6",
                               "2,4": "??",
                               },
                               calcColBoundsTriangle);
</script>

Even though the model can compute (1 + 2) and (3 + 3), it has no way of passing
(3 + 3 = 6) to the next few tokens. So, (6 + 4) never gets calculated, and the
model has to guess once again.

Crucially, giving the model more tokens doesn't help us here. Whether we
tokenize the problem as `1` `+` `2` `+` `3` `+` `4` or `1 + 2` `+ 3` `+4`,
the model can't make use of the extra compute, because it is bottlenecked
by information flow. Even though the model uses more than twice the compute
for the former compared to the latter, it is no more capable of solving the 
problem.

<div id="flowchart_tokenized" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_tokenized", 4, ["1", "+", "2", "+", "3", "+", "4", "="], 
                              ["",  "", "=", "", "=", "", "", "??"], 
                              [3, 3, 3, 8], false, 
                              {"1,2": "3",
                               "2,4": "6",
                               "2,6": "??",
                               "2,7": "??",
                               },
                               calcColBoundsTriangle);
</script>

We can easily teach our single-layer model to solve problems that stump our two layer 
model, though. A fairly natural way to do this - natural in the sense that it's similar to the types
of text the model has already learnt to produce - is **simulated reasoning**. We let our model generate
intermediate tokens that move results out of the inaccessible latent stream of the model
and into the model's context.


<div id="flowchart_reason" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason", 3, ["1", "+", "2", "+", "3", "="], 
                              ["", "", "", "", "", "&ltthink&gt"], 
                              [6, 6, 6], false, 
                              {
                              },
                               calcColBoundsTriangle, true);
</script>

Instead of answering right away, the model indicates it wants to spend some time "thinking".


<div id="flowchart_reason2" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason2", 3, ["&ltthink&gt", "1", "+", "2", "="], 
                              ["1", "+", "2", "=", "3"], 
                              [5, 5, 5], false, 
                              {
                                "1,3": "3",
                                "1,4": "3",
                              },
                               calcColBoundsTriangle, true);
</script>

Here, the model recalculates 1 + 2 (remember, it can't access the earlier calculations). Now that it's in
thinking mode, it gets to write this result directly into the context and read it back in as the next input
token, giving all calculations on subsequent tokens access.

<div id="flowchart_reason3" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_reason3", 3, ["=", "3", ",", "3", "+", "3", "=", "6"], 
                              ["3", ",", "3", "+", "3", "=", "6", "&lt/think&gt"], 
                              [8, 8, 8], false, 
                              {
                                "1,0": "3", 
                                "1,5": "6",
                                "1,6": "6",
                              },
                               calcColBoundsTriangle, true);
</script>

Now, the model gets to calculate 3 + 3 instead of (1+2) + 3. It does so easily, and
writes the answer into the context stream. Finally, it emits a `</think>` token
to signal the end of thinking mode.

The full sequence looks like:
<div id="reason-chat"></div>
<script>
makeChat("reason-chat", ["1 + 2 + 3 = ",
"&ltthink&gt \n1 + 2 = 3, \n3 + 3 = 6 \n&lt/think&gt \n\n 6"]);
</script>

### Progress, but at what cost?

This little demonstration shows how simulated reasoning can help a model's performance. Our little model
could keep performing this trick on more and more complicated sequences, and keep succeeding. This alone
is quite impressive.

However, you've hopefully also noticed some less desirable side-effects. Firstly, this process is **slow**,
and woefully inefficient. Even though the model could (and did) calculate (1 + 2) very early on, it has to 
recompute it multiple times. Plus, all the filler tokens where the model restates the problem do nothing
to directly solve the task at hand, but **do** add to its cost. Each token, after all, uses the same amount
of compute. The more verbose a model's reasoning is, the more costly. 

In terms of parallelizable tasks, perhaps this verbosity really does allow a model access to compute it needs
to improve its answers. But if the reasoning is simply using (a lot of) tokens to move very small chunks of information
around, it is woefully inefficient.



## Critical Path

To drive home the point, lets look at the critical path of information flow through
a transformer. Here, the tokens aren't introducing any new information. From the very
first token, the model has all the information it needs - its job is to distribute the work,
perform calculations, make a decision based on those calculations, and ultimately output
an answer.

We are drawing what's called the critical path. This means that each layer relies on
some information from the previous layer to be ready before it can make a decision, perform
a calculation, etc.

Here, we display a critical path through the model. Each layer needs some information from
the previous layer's calculations before it can start with its own. 

Any grey nodes above the critical path don't have enough information yet to get started, and
so are irrelevant to this chain of decisions. These nodes have to guess, or work on something else.
Any grey nodes below the critical path don't add any extra information to the 
chain of decisions, and so likewise
are irrelevant.

<div id="flowchart_critpath" style="width: 100%;"></div>
<script>
addFlowchart("flowchart_critpath", 7, ["", "", "", "", "", "", ""], 
                              ["", "", "", "", "", "", ""], 
                              [1,2,4,5,6,7,7], true, 
                              {
                               },
                               calcColBoundsSnake);
</script>

The model has a lot of freedom to parallelize problems that might be tricky. But even though
it has lots of tokens worth of compute to play with, it can't actually make very many decisions.

In fact, the depth of the critical path is fixed to the same number as if the model was processing
a single token. Each calculation can be split across more tokens and parallelized, but only 
a finite number of decisions can depend on each other.



All of this assumes that layers are ordered perfectly for whatever serial calculation needs to take 
place. It might not be especially easy for a model to learn how to do maths in every single layer, and
so it's also quite possible that the effective model depth drops off even faster than shown here.



## The Question

Given what we've seen, it can be hard to know how seriously to take a chain-of-thought. In an ideal world,
a model's reasoning would be an accurate representation of how it arrived at an answer. The reality appears
more complicated. 

One question I'm particularly interested in: when does the model actually choose its final answer? 

Why is this an interesting question to ask?

- We want to be able to trust a model's chain of thought. Having (accurate) human-readable text describing what a model
is doing and why is basically the gold standard for AI Safety.

- If we want to review a model's reasoning, we don't want to wade through paragraphs of post-hoc justification.
- We want to know whether/to what degree we can trust a model's chain of thought to explain how it has made
its choices. If some/all of its working has no impact on the final answer, we know not to trust it (?)
- It's possible a model could come up with an initial guess, and then uses later reasoning to refine this estimate.


- If a model doesn't actually use its reasoning tokens to do reasoning, then why bother emit them? Is it 
pursuing a secondary goal of *looking like it's reasoning*?
- Do phrases like "Wait wait wait", "But!" etc. actually matter? 

1. How much of the chain-of-thought actually matters? 

Could a model decide on its answer early on, and then spend time going through the charade of writing out reasoning?

In particular, I'm trying to tease apart what a model does and doesn't know - whether it has 'secretly' stored its 
answer away, or if it truly doesn't come up with an answer until the very end.


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
