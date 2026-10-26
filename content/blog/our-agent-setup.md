---
title: "Our Agent Setup: A Cockpit and a Primary Agent"
date: "2026-10-26"
tags: ["ai", "programming"]
description: "One cockpit with our own taste in it, a primary agent that fans work out to sub-agents and folds it back in, and a short agreement that keeps them in line."
raw_at: "2026-10-26T19:10"
---

Some notes on how we run coding agents these days. This isn't a recipe. Take the ideas, bend them, and turn them into your own.

## The cockpit

- One launch point for all the projects we manage. We call it the cockpit.
- It holds what isn't specific to any project: our delivery preferences, how we operate agents, and other generic instructions.
- Think of it as our personal taste. It adapts to each project's own instructions, and inside a project, the project's instructions win. The cockpit grants nothing by itself.
- It also keeps a directory per project, a mixed bag of notes, diagrams, reports and whatever else piles up.
- We normally run a separate session per project, each in its own terminal or window pane. Nothing stops one session from handling several projects, I just find it easier to context switch when they're different panes.
- It's all just markdown, no runtime.

<figure class="diagram">
<svg viewBox="0 0 360 180" role="img" aria-label="The cockpit holds one session per pane. Each session works on its own project and follows that project's own instructions.">
	<defs><marker id="cockpit-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect class="dashed" x="10" y="10" width="160" height="160" rx="6"/>
	<text x="90" y="32">cockpit</text>
	<rect x="25" y="48" width="130" height="40" rx="4"/>
	<text x="90" y="65">session</text>
	<text class="muted small" x="90" y="80">pane 1</text>
	<rect x="25" y="100" width="130" height="40" rx="4"/>
	<text x="90" y="117">session</text>
	<text class="muted small" x="90" y="132">pane 2</text>
	<text class="muted small" x="90" y="160">our taste, project notes</text>
	<line x1="155" y1="68" x2="213" y2="68" marker-end="url(#cockpit-arrow)"/>
	<line x1="155" y1="120" x2="213" y2="120" marker-end="url(#cockpit-arrow)"/>
	<rect x="215" y="48" width="130" height="40" rx="4"/>
	<text x="280" y="65">project a</text>
	<text class="muted small" x="280" y="80">its own instructions</text>
	<rect x="215" y="100" width="130" height="40" rx="4"/>
	<text x="280" y="117">project b</text>
	<text class="muted small" x="280" y="132">its own instructions</text>
</svg>
<figcaption>One cockpit, one session per project. Each project's own instructions win.</figcaption>
</figure>

## A primary agent and its sub-agents

- I talk to one agent only, the primary agent. It's the communication point.
- It splits the request into pieces and hands each piece to a sub-agent. These are the harness's normal sub-agents, nothing custom.
- A sub-agent doesn't get the whole conversation, it gets a brief:
  - which project, and which of its instructions to read
  - the piece it owns, and what it must not touch
  - what it's allowed to do
  - how to show the result, and where to report back
- It returns something compact: the result, where it is, what proves it, what's left, the next step and one observation.
- Even with this setup, the sub-agents still pick up each project's own style. Some of our projects are spec-driven, some do BDD or TDD, and the sub-agents follow along.

<figure class="diagram">
<svg viewBox="0 0 360 270" role="img" aria-label="Me to the primary agent and back. The primary agent, in the cockpit, sends briefs to three sub-agents inside the project and gets returns back.">
	<defs><marker id="setup-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="140" y="10" width="80" height="30" rx="4"/>
	<text x="180" y="30">me</text>
	<line x1="165" y1="40" x2="165" y2="88" marker-end="url(#setup-arrow)"/>
	<line x1="195" y1="90" x2="195" y2="42" marker-end="url(#setup-arrow)"/>
	<text class="muted" x="158" y="68" text-anchor="end">request</text>
	<text class="muted" x="202" y="68" text-anchor="start">report</text>
	<rect class="accent" x="95" y="90" width="170" height="40" rx="4"/>
	<text x="180" y="108">primary agent</text>
	<text class="muted small" x="180" y="123">in the cockpit</text>
	<rect class="dashed" x="10" y="165" width="340" height="95" rx="6"/>
	<line x1="160" y1="132" x2="72" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<line x1="180" y1="132" x2="180" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<line x1="200" y1="132" x2="288" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<text class="muted" x="108" y="152" text-anchor="end">brief</text>
	<text class="muted" x="252" y="152" text-anchor="start">return</text>
	<rect x="20" y="185" width="100" height="36" rx="4"/>
	<text x="70" y="207">sub-agent</text>
	<rect x="130" y="185" width="100" height="36" rx="4"/>
	<text x="180" y="207">sub-agent</text>
	<rect x="240" y="185" width="100" height="36" rx="4"/>
	<text x="290" y="207">sub-agent</text>
	<text class="muted small" x="180" y="248">the project</text>
</svg>
<figcaption>I only talk to the primary agent. Sub-agents do their piece inside the project.</figcaption>
</figure>

## Protecting the primary agent's context

- The primary agent is the long-running one. It stays up across the whole request.
- So we protect its context. Anything substantial goes to a sub-agent, even reading and searching.
- The raw logs stay with the sub-agents. The primary only keeps the intent, the decisions and a short summary of each return.
- A primary agent with a clean context remembers what I asked for. One full of logs starts to drift.

## Fan-out, fold-in

That's what we call the approach.

- **Fan-out.** Split the work into bounded pieces and hand them out, in parallel when they don't touch the same files.
- **Fold-in.** The primary agent reads the returns, reconciles them, and runs the combined thing itself. A sub-agent saying done is input, not acceptance.
- We run it as a loop with progressive refinement: a thin pass across the whole thing first, then deeper each round.
- More on that combo, and the task list that keeps the loop honest, in [the next post](/blog/fan-out-fold-in-refine/).

## The agreement

A short doc every agent reads. Just guardrails, nothing fancy.

- **Authority.** The project's own rules, my intent and what I've already allowed. The agreement itself grants nothing.
  - Agents don't re-ask for things I already decided.
  - They only ask me when it's a new call that only I can make.
- **Harness native first.** Use what the tool already has: its sub-agents, task list, the forge, CI.
  - Something missing? Do a manual step or say the limit. No new machinery.
- **Scope.** The request fixes what done is.
  - Findings can change how we get there, never silently grow what we deliver.
- **Sizing.** Tiny work gets done directly, no plan, no sub-agent. Bigger work gets split by outcome.
- **Communication.** Outcomes and decisions, short.
  - Bulky evidence stays where it lives and gets linked.
  - Brief in, compact return out, always the same shape.
- **What done looks like.** Judged by the outcome, not the activity.
  - The primary agent runs the combined thing and checks the actual behavior before calling it done.
  - A pause, a handoff or a missing permission isn't success.
- **Continuity.** At a handoff or a pause, the primary agent leaves a pickup note in the cockpit:
  - the outcome and where things are
  - what's done, and the proof
  - what's left, and the next step
  - The next session starts from that note and the real files, not from memory.
- **Lessons.** Every return carries one observation, or "nothing material".
  - Facts about the project go to the project.
  - Lessons about the process become a proposed change to the agreement, never a silent rule change.

## Staying focused

- Some rules exist only because current models slip. They:
  - drift into cleanup nobody asked for
  - call it done from a green check
  - guess the contents of a file they couldn't read
- We tag those rules as shims.
- When a new model comes out, we rerun the checks without the shim. If it keeps passing, the rule goes.
- The rest, authority, scope and what done means, stay no matter how good the models get.

More notes as it changes.
