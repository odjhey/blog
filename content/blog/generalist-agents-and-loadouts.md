---
title: "Jobs and Loadouts"
date: "2026-10-27T22:43"
tags: ["ai", "programming"]
extends: "fan-out-fold-in-refine"
primary: true
description: "Our agents work like RPG jobs, where the job comes from the main equip. Mostly generalists, narrow ones for a few cases, and maybe thin slices are why it works for us."
raw_at: "2026-10-27T22:43"
---

Some notes on how work is divided between agents, on top of [how I currently run agents](/blog/our-agent-setup/). It comes back to the thin slices of [progressive refinement](/blog/fan-out-fold-in-refine/).

## Jobs (or is this a persona?)

Like jobs in RPGs, where your job depends on your main equip. Swap the weapon and the job changes with it.
That's how our agents work. Same general instructions underneath, and the job comes from what it's equipped with. A build job, a review job, a verify job. Is this a persona? Unsure.

- If a persona is the "you are a so and so with 15 years of experience", plus a voice and a tone, then we don't do personas.
- A job is only what it's equipped to do. No backstory.
- And we don't do the narrow kind either, a backend agent, a frontend agent.
- I read somewhere they call this "per context needs", spawning agents per the context they need.

Most of the time it's a generalist with a loadout. We observed a side effect, the loadout alone is usually enough for an agent to know its job.

## Loadouts

A loadout is the main equip, the tools an agent has or the tools it reaches for first. It's mostly about who got access to what. We manage it per access.

And by multi-agent we mean it in broad strokes, not just sub-agents.

- Sub-agents in one session.
- Primary agents in other panes.
- Agents on other machines behind [the desk](/blog/a-desk-not-a-dispatcher/).

<figure class="diagram">
<svg viewBox="0 0 360 140" role="img" aria-label="Three identical agents. Each has a different loadout, and the loadout decides its job: repo and ci for build, a browser for verify, read only for review.">
	<defs><marker id="job-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="15" y="10" width="100" height="30" rx="4"/>
	<text x="65" y="29">agent</text>
	<rect x="130" y="10" width="100" height="30" rx="4"/>
	<text x="180" y="29">agent</text>
	<rect x="245" y="10" width="100" height="30" rx="4"/>
	<text x="295" y="29">agent</text>
	<rect class="accent" x="15" y="48" width="100" height="40" rx="4"/>
	<text class="muted small" x="65" y="64">loadout</text>
	<text class="small" x="65" y="79">repo, ci</text>
	<rect class="accent" x="130" y="48" width="100" height="40" rx="4"/>
	<text class="muted small" x="180" y="64">loadout</text>
	<text class="small" x="180" y="79">browser</text>
	<rect class="accent" x="245" y="48" width="100" height="40" rx="4"/>
	<text class="muted small" x="295" y="64">loadout</text>
	<text class="small" x="295" y="79">read only</text>
	<line x1="65" y1="88" x2="65" y2="106" marker-end="url(#job-arrow)"/>
	<line x1="180" y1="88" x2="180" y2="106" marker-end="url(#job-arrow)"/>
	<line x1="295" y1="88" x2="295" y2="106" marker-end="url(#job-arrow)"/>
	<text x="65" y="124">build</text>
	<text x="180" y="124">verify</text>
	<text x="295" y="124">review</text>
</svg>
<figcaption>Same agent. The equip decides the job.</figcaption>
</figure>

## When we go narrow

Some things don't fit a generalist, and sometimes we want to constrain an agent on purpose.

- Code-blind work, like verifying a feature without looking at the code.
- When we can't start the entire app stack locally.
- Specialized checks, like security audits.

And a few more edge cases we can't list here.

## It seems to work, for us

Mostly, prolly, because models are getting better and better.

But maybe also because we do progressive refinement.

- Each pass is a thin, complete slice, MVP style, refined on each loop pass.
- A slice crosses every part of the path, so whoever carries it has to reach every part.
- Narrow agents seem to learn less. Generalists pick up more along the way, and each pass can repivot.
- Our iterate and workgraph methods lean the same way, splitting by journey, not by narrow sub-components.
- The agents are not mere encoders, and lessons from experience seem to get shared better this way. After all, we're buying them for the intelligence, not for faster typing from a spec. (Btw, I don't write much detailed spec, unless it's architecture.)

<figure class="diagram">
<svg viewBox="0 0 360 150" role="img" aria-label="Two grids of three parts, ui, api and data, three rounds deep. A narrow agent fills one part all the way down. A thin slice fills the first round across all three parts.">
	<text x="90" y="14">narrow</text>
	<text x="270" y="14">thin slice</text>
	<text class="muted small" x="42" y="34">ui</text>
	<text class="muted small" x="90" y="34">api</text>
	<text class="muted small" x="138" y="34">data</text>
	<text class="muted small" x="222" y="34">ui</text>
	<text class="muted small" x="270" y="34">api</text>
	<text class="muted small" x="318" y="34">data</text>
	<rect class="solid" x="20" y="40" width="44" height="20"/>
	<rect class="dashed" x="68" y="40" width="44" height="20"/>
	<rect class="dashed" x="116" y="40" width="44" height="20"/>
	<rect class="solid" x="20" y="64" width="44" height="20"/>
	<rect class="dashed" x="68" y="64" width="44" height="20"/>
	<rect class="dashed" x="116" y="64" width="44" height="20"/>
	<rect class="solid" x="20" y="88" width="44" height="20"/>
	<rect class="dashed" x="68" y="88" width="44" height="20"/>
	<rect class="dashed" x="116" y="88" width="44" height="20"/>
	<rect class="solid" x="200" y="40" width="44" height="20"/>
	<rect class="solid" x="248" y="40" width="44" height="20"/>
	<rect class="solid" x="296" y="40" width="44" height="20"/>
	<rect class="dashed" x="200" y="64" width="44" height="20"/>
	<rect class="dashed" x="248" y="64" width="44" height="20"/>
	<rect class="dashed" x="296" y="64" width="44" height="20"/>
	<rect class="dashed" x="200" y="88" width="44" height="20"/>
	<rect class="dashed" x="248" y="88" width="44" height="20"/>
	<rect class="dashed" x="296" y="88" width="44" height="20"/>
	<text class="muted small" x="90" y="130">one part, deep</text>
	<text class="muted small" x="270" y="130">the whole path, thin</text>
</svg>
<figcaption>A narrow agent finishes a part. A thin slice finishes a journey, roughly.</figcaption>
</figure>

## Human attention

Aside from the usual budgets, we factor in human attention (should write more about this later).

Thin slices help us a ton here too.

- Each refinement is a whole journey I can touch, so I can verify it async, whenever I have time.
- Less waiting on one narrow part that only makes sense once everything else exists.
- Plans change with each refinement, [what one slice turns up can reshape the next](/blog/fan-out-fold-in-refine/).

Wait, is this some RSI-lite (recursive self-improvement) loop kind of thing?

<figure class="diagram">
<svg viewBox="0 0 360 120" role="img" aria-label="Agents run pass 1, pass 2 and pass 3 in a row. Below, I look at pass 1 and pass 3 later, when I have time.">
	<defs><marker id="attention-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<text class="muted" x="10" y="35" text-anchor="start">agents</text>
	<rect x="70" y="18" width="70" height="26" rx="4"/>
	<text x="105" y="35">pass 1</text>
	<line x1="140" y1="31" x2="148" y2="31" marker-end="url(#attention-arrow)"/>
	<rect x="150" y="18" width="70" height="26" rx="4"/>
	<text x="185" y="35">pass 2</text>
	<line x1="220" y1="31" x2="228" y2="31" marker-end="url(#attention-arrow)"/>
	<rect x="230" y="18" width="70" height="26" rx="4"/>
	<text x="265" y="35">pass 3</text>
	<text class="muted" x="10" y="95" text-anchor="start">me</text>
	<line x1="105" y1="44" x2="143" y2="76" marker-end="url(#attention-arrow)"/>
	<rect class="accent" x="125" y="78" width="60" height="26" rx="4"/>
	<text x="155" y="95">look</text>
	<line x1="265" y1="44" x2="303" y2="76" marker-end="url(#attention-arrow)"/>
	<rect class="accent" x="285" y="78" width="60" height="26" rx="4"/>
	<text x="315" y="95">look</text>
</svg>
<figcaption>Each pass is something whole I can check when I have time.</figcaption>
</figure>
