---
title: "Generalist Agents and Loadouts"
date: "2026-10-27T22:43"
tags: ["ai", "programming"]
extends: "fan-out-fold-in-refine"
primary: true
description: "Most of our agents are generalists. We split by job and access, not by layer or persona, and thin slices are what make that work, for the agents and for my attention."
raw_at: "2026-10-27T22:43"
---

How we divide work between agents, on top of [how I currently run agents](/blog/our-agent-setup/). Most of it comes back to the thin slices of [progressive refinement](/blog/fan-out-fold-in-refine/).

## Generalists, mostly

- Most of our agents are generalists. Any of them can take a slice from input to result.
- We do have roles, just not by layer. No backend agent, no frontend agent.
- And no personas either. No "you are a senior engineer with 15 years of experience", no voice, no tone.
- A role for us is a job in the loop, like build, review or verify, plus what it can access.
- I used to think it was generalists 99% of the time. Writing this down, prolly less. Still the majority.

## When we go narrow

- Code-blind work, like verifying a feature without looking at the code.
- When we can't start the entire app stack locally.
- Specialized checks, like security audits.

## Why I think it works

- Models getting better and better helps. Aside from that, I think generalists work for us because we also do progressive refinement.
- Each pass is a thin, complete slice, MVP style, refined on each loop pass.
- A slice crosses every part of the path, so whoever carries it has to reach every part. An agent that only knows one layer can't carry a whole slice.
- Our iterate and workgraph methods follow the same idea. They split by journey, not by narrow sub-components.

<figure class="diagram">
<svg viewBox="0 0 360 150" role="img" aria-label="Two grids of three parts, ui, api and data, three rounds deep. Split by layer, one agent fills one part all the way down. Split by slice, one agent fills the first round across all three parts.">
	<text x="90" y="14">by layer</text>
	<text x="270" y="14">by slice</text>
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
<figcaption>Split by layer, an agent finishes a part. Split by slice, it finishes a journey, thin.</figcaption>
</figure>

## Loadouts

- A loadout is just the tools an agent has available, or the tools it reaches for first.
- It's more about who got access to what, and we manage it per access.
- Same generalist, different loadout.
- By multi-agent we mean it in broad strokes. Sub-agents inside one session, primary agents in other panes, and agents on other machines behind [the desk](/blog/a-desk-not-a-dispatcher/).

<figure class="diagram">
<svg viewBox="0 0 360 120" role="img" aria-label="Three identical generalist agents, each with a different loadout of access underneath.">
	<rect x="15" y="10" width="100" height="34" rx="4"/>
	<text x="65" y="31">generalist</text>
	<rect x="130" y="10" width="100" height="34" rx="4"/>
	<text x="180" y="31">generalist</text>
	<rect x="245" y="10" width="100" height="34" rx="4"/>
	<text x="295" y="31">generalist</text>
	<rect class="accent" x="15" y="52" width="100" height="44" rx="4"/>
	<text class="muted small" x="65" y="70">loadout</text>
	<text class="small" x="65" y="86">repo, ci</text>
	<rect class="accent" x="130" y="52" width="100" height="44" rx="4"/>
	<text class="muted small" x="180" y="70">loadout</text>
	<text class="small" x="180" y="86">repo, browser</text>
	<rect class="accent" x="245" y="52" width="100" height="44" rx="4"/>
	<text class="muted small" x="295" y="70">loadout</text>
	<text class="small" x="295" y="86">read only</text>
	<text class="muted small" x="180" y="114">who gets what is about access</text>
</svg>
<figcaption>Same agent, different loadouts.</figcaption>
</figure>

## Human attention

- Building stuff has budgets. One of ours is human attention, probably its own entry someday.
- Thin slices help here too. Each refinement is a whole journey I can touch, so I can verify it async, whenever I have time.
- No waiting a long time for one narrow part that only makes sense once everything else exists.
- Plans change with each refinement, [what one slice turns up can reshape the next](/blog/fan-out-fold-in-refine/).
- Probably some lite RSI (recursive self-improvement) loop kind of thing. Not sure.

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
