---
title: "Jobs and Loadouts"
date: "2026-10-27T22:43"
tags: ["ai", "programming"]
extends: "fan-out-fold-in-refine"
primary: true
description: "Still figuring this out. Our agents work a bit like RPG jobs, where the job comes from the main equip. Mostly generalists, a few narrow ones, and a hunch that thin slices are why it works."
raw_at: "2026-10-27T22:43"
---

Still figuring this out. Some notes on how we divide work between agents right now, on top of [how I currently run agents](/blog/our-agent-setup/). A lot of it seems to come back to the thin slices of [progressive refinement](/blog/fan-out-fold-in-refine/). Could be wrong.

## Jobs (or is this a persona?)

- Think of jobs in RPGs, where your job depends on your main equip. Swap the weapon and the job changes with it.
- That's roughly how our agents work, I think. Same agent underneath, the job comes from what it's equipped with. A build job, a review job, a verify job.
- Is a job just a persona with extra steps? We don't think so, but not fully sure.
  - A persona is who the agent pretends to be. "You are a senior engineer with 15 years of experience", plus a voice and a tone.
  - A job is only what it's equipped to do. No backstory.
- We also don't do the narrow kind, a backend agent, a frontend agent.
- So most of the time it's a generalist with a job. I used to think 99% of the time. Writing this down, prolly less. Still the majority, I think.

## Loadouts

- A loadout is the main equip. The tools an agent has, or the tools it reaches for first.
- It's mostly about who got access to what, and we manage it per access.
- By multi-agent we mean it in broad strokes. Sub-agents in one session, primary agents in other panes, agents on other machines behind [the desk](/blog/a-desk-not-a-dispatcher/).

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

- Some things don't fit a generalist, at least for us.
  - Code-blind work, like verifying a feature without looking at the code.
  - When we can't start the entire app stack locally.
  - Specialized checks, like security audits.
- There are probably more we haven't noticed yet.

## Why it seems to work

- Honestly not sure. Models getting better and better is probably a big part of it.
- Aside from that, I think generalists work for us because we also do progressive refinement.
  - Each pass is a thin, complete slice, MVP style, refined on each loop pass.
  - A slice crosses every part of the path, so whoever carries it has to reach every part. A narrow agent can't carry a whole slice. That's the theory anyway.
- Our iterate and workgraph methods lean the same way. They split by journey, not by narrow sub-components.
- Could also be that we just haven't hit the cases where narrow agents win.

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

- Building stuff has budgets. One of ours is human attention, probably its own entry someday.
- Thin slices seem to help here too. Each refinement is a whole journey I can touch, so I can verify it async, whenever I have time.
- Less waiting on one narrow part that only makes sense once everything else exists.
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
