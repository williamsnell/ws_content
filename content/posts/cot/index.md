+++
draft = false
title = "Investigating Chain-of-thought Faithfulness"
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



//


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
//


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
