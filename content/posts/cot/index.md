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
<script src="diagram.js"></script>

The advent of reasoning models like OpenAI's O1/O3 and DeepSeek's R1 has brought gifts and challenges
for the field of AI safety. For the uninitiated, *reasoning* allows models to write intermediate text
before providing their final answer. 

The distinction between true "reasoning" models, and models that just employ chains-of-thought, is somewhat
blurry. Generally, reasoning models (might) go through specific reinforcement-learning post-training. 
The presence of `<think>` tokens, or similar, could also be used to categorize a reasoning model. These 
special tokens "hide" the thought process of the model so that it is only graded on its final answer,
not its entire chain of thought.


Before the advent of chains-of-thought (and later, reasoning), LLMs would typically only output a few tokens between being asked
a question and providing their answer.

If we ask an LLM a hard question, it might struggle to answer 

<script src="chat.js"></script>
<div id="chat A"></div>

<script>
makeChat("chat A", ["What river flows through Mareeba?",
          "**The Herbert River** flows through Mareeba."
          ]);
</script>


This answer is wrong - the *Barron* river flows through Mareeba, although the Herbert is a better
known river a few hundred kilometres away.

Transformer-based Large language models perform about the same amount of computation each time
they generate a token of text. That means the model in
scenario A can only do a little bit of computation before returning its answer. 
Specifically, after reading the word "Mareeba", it might have 3 tokens to do all of its computation - something like "?", "**", "The".
After that, it has to provide an answer. And so it picks - wrongly - the first river in the region that comes to mind.

Instead, we can tell the model to explicitly think through the problem. All the extra tokens generated
before the final answer give the model an opportunity to "think" for longer.

//Scenario B

<div id="chat B"></div>
<script>
makeChat("chat B", ["Think step by step. What river flows through Mareeba?",
          `Here's how we can figure that out:

    Mareeba is a town:  We know this because it's likely a place name.
    Towns are often located near rivers: Rivers provide water sources, transportation routes, and fertile land for agriculture.
    We need to research: To find the specific river, we'd need to look up information about Mareeba.

Using a search engine, we find that the river that flows through Mareeba is the Barron River.

Let me know if you have any other geography questions!`
          ]);
</script>

// Note that this model does **NOT** have access to a search engine. For whatever reason,
producing the string of text "Using a search engine, we find that ..." seems to get us the 
right answer.

This is our first example of an unfaithful chain of thought - although the model arrived at the
right answer, it's reasoning is provably false - we didn't give it access to a 
search engine, after all. The rest of its reasoning is also suspect - does repeating the fact
that rivers are useful for agriculture really help the model find the specific river it wants?

Longer chains of thought are also not 
a panacea - in Scenario C, the model produces very similar text to Scenario B, but crucially,
gets the answer wrong anyway. Even more interesting, its thought process seems a lot more 
on-topic - it recalls that Mareeba is in Queensland, Australia, and it describes several 
related rivers (although the Murray river is not actually in Queensland.)

// Scenario C

<div id="chat C"></div>

<script>
makeChat("chat C", ["Think step by step. What river flows through Mareeba?",
`Here's how to figure that out:

    Mareeba is a town in Australia.  This helps narrow down the search to rivers in Australia.
    Think about major rivers in Queensland. Mareeba is in Queensland. Some well-known rivers in Queensland include the Brisbane River, the Murray River, and the Fitzroy River.
    Research rivers near Mareeba.  You can use a map or online search to find rivers that flow through or near Mareeba.

The answer: The Herbert River flows through Mareeba.

Let me know if you'd like to know more about the Herbert River!`]);
</script>

## How does reasoning work?



Here is our transformer. It takes in a single token of text - the word "The" - 
passes it through 3 layers of computation, and spits out its prediction
for the next word: " 1970s".

Each layer is a discrete unit that can do some amount of work. For simplicity,
let's think of the layers as fairly basic, and self contained. This isn't really
the case in reality, but it lets us reason about how the model works without
losing the forest for the trees.

We'll think of each layer (one of the 3 rectangles in the middle) as being
able to do a unit of work - perhaps a simple calculation on two numbers,
or looking up a single fact.

Let's run a single word through our transformer, and see what it predicts.


<div id="flowchart2" style="width: 100%;"></div>

<script>
const highlightConnections = addFlowchart("flowchart2", 5, ["The"], ["1970s"], null, false);

function animate() {
    highlightConnections([1]);
    setTimeout(() => highlightConnections([1, 1]), 1000);
    setTimeout(() => highlightConnections([1, 1, 1]), 2000);
    setTimeout(() => highlightConnections([1, 1, 1, 1]), 3000);
    setTimeout(() => highlightConnections([1, 1, 1, 1, 1]), 4000);
    setTimeout(animate, 5000);
}

animate();
</script>

The arrows show information flow. Each layer can read the outputs 
of the previous layers. Most layers pass on information from earlier 
layers, too. Therefore, the very last layer (just before predicting "1970s")
can in principle access any result from any previous layer.

When we want to process a longer passage of text, say, "The cat sat", 
we split the sentence into chunks called "tokens" and 
repeat this process in parallel.

<div id="flowchart7" style="width: 100%;"></div>

<script>
let frame = 0;
function colLabels(nodes, prevNodes) {
    let out = [new Array(frame + 1).fill(0), new Array(frame + 1).fill(3)];

    frame = (frame + 1) % 5;

    return out;
}

const hc_2 = addFlowchart("flowchart7", 5, ["The"," cat"," sat"], [" 1970s","hedral"," on"],
             [0], false, null, colLabels);

function animate2() {
    hc_2(new Array(frame + 1).fill(0));
    setTimeout(animate2, 1000);
}

animate2();
</script>

Importantly, we haven't made the model any bigger. Each of the 3 layers perform
the exact same calculations as before. What's changed is that they have access
to new information.

Firstly, each pass through the model (represented as a vertical column)
is initialized with the new token value. 

Secondly, each layer can look back at results of other layers, 
provided a) the token is earlier in the sequence,
and b) the layer is earlier in the model. This is shown by the highlighted
portions of the model. Any grayed-out layers are inaccessible to the current layer.

To generate text, we take the output of the last token (`on`) and add it to 
the text sequence, and then run the model again on the new, longer sequence.

<div id="flowchart_gen" style="width: 100%;"></div>

<script>
let frame2 = 0;
function colLabelsGen(nodes, prevNodes) {
    let out = [new Array(frame2 + 1).fill(0), new Array(frame2 + 1).fill(4)];

    if (frame2 >= 3) {
        out[0].splice(3, out[0].length, ...new Array(out[0].length).fill(3));
    }

    frame2 = (frame2 + 1) % 5;

    return out;
}

const hc_gen = addFlowchart("flowchart_gen", 5, ["The"," cat"," sat", "on"], [" 1970s","hedral"," on", "the"],
             [0,0,0,0,0], false, null, colLabelsGen);

function animate3() {
    hc_gen([0, 0, 0, 0, 0]);
    setTimeout(animate3, 1000);
}

animate3();
</script>




<div id="flowchart6" style="width: 100%;"></div>

<script>
addFlowchart("flowchart6", 5, ["The"," cat"," sat"," on", " the", " child"], [" 1970s","hedral"," on"," the", " mat", " ."],
             null, true, null, calcColBoundsTriangle);
</script>

## An example with maths.

Let's consider a simple transformer with only one layer. Each layer can only
do something simple. Let's imagine it can handle performing a maths operation
(addition, subtraction, multiplication, etc.) on two numbers, but nothing more.

For example, we could ask it what 1 + 1 is:

<div id="flowchart_facile" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile", 3, ["1", "+", "1", "="], 
                              ["", "", "=", "2"], [3, 3, 4], false, 
                              {
                               "1,2": "2",
                               "1,3": "2",
                              });
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

If the model was working on something parallelizable, it could also split the
work across the next few tokens. For example, if it was adding vectors:

<div id="flowchart_facile_serial4" style="width: 100%;"></div>

<script>
addFlowchart("flowchart_facile_serial4", 4, ["[1, 2, 3]", "+", "[4, 5, 6]", "+", "[7, 8, 9]", "="], 
                              ["", "", "=", "", "=", "6"], 
                              [3,3,6,6], false, 
                              {
                                  "1,2": "1+4 = 5",
                                  "1,3": "2+5 = 7",
                                  "1,4": "3+6 = 9",
                              },
                               );
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



<div id="flowchart4" style="width: 100%;"></div>
<script>
addFlowchart("flowchart4", 4, ["((", "60 - 45)", "+5)", "x 9"], 
                              ["", "= 15", "= 20", ""], 
                              [2,2], false, 
                              {"1,1": "15",
                               "1,2": "? + 5",
                               "2,2": "20",
                               "2,3": "? x 9",
                               "1,3": "?? x 9"});
</script>

We can see that our first layer has enough information to perform its
simple maths operation. So, it calculates (60 - 45) = 15. This information
is now stored for any subsequent layers to access.

<div id="flowchart5" style="width: 100%;"></div>
<script>
addFlowchart("flowchart5", 4, ["((", "60 - 45)", "+5)", "x 9"], 
                              ["", "= 15", "= 20", ""], 
                              [2,3,3,3], false, 
                              {"1,1": "15",
                               "2,2": "20",
                               "2,3": "? x 9",
                               "1,3": "?? x 9"},
                               calcColBoundsTriangle);
</script>

We can see that when the model processes the "+5)" token, it doesn't 
have enough information in the first layer. However, in the second layer,
it now has access to the "15" we just calculated! 15 + 5 = 20, and so the 
second layer outputs the value of "20".


<div id="flowchart8" style="width: 100%;"></div>
<script>
addFlowchart("flowchart8", 4, ["((", "60 - 45)", "+5)", "x 9"], 
                              ["", "= 15", "= 20", ""], 
                              [1,2,3,4], false, 
                              {"1,1": "15",
                               "2,2": "20",
                               "2,3": "? x 9",
                               },
                               calcColBoundsTriangle);
</script>

When we get to the fourth token "x 9", we definitely don't have enough 
information in the first layer. In the second layer, even though we know
that (60 - 45) = 15, we don't know exactly what (15 + 5) equals. We could
compute it, but then we couldn't compute the "x 9" portion of the sum. 
So, like last time, we have to guess. Based solely on vibes, 200 feels about right.


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
