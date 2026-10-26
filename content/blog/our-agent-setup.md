---
title: "Our Agent Setup: Fan-Out, Fold-In"
date: "2026-10-26"
tags: ["ai", "programming"]
description: "One cockpit for all our projects, a primary agent that fans work out to sub-agents and folds it back in, and a short agreement that keeps them in line."
raw_at: "2026-10-26T19:10"
---

Some notes on how we run coding agents these days. This isn't a recipe. Take the ideas, bend them, and turn them into your own.

## The cockpit

- One launch point for all the projects we manage. We call it the cockpit.
- The cockpit maintains a directory of our projects: where each one lives, its checks, what agents are allowed to do there, standing rules and where we left off.
- The cockpit grants nothing by itself. The agent reads the agent instructions of the project it's working on and follows those inside that project.
- We normally use a separate session per project, each in its own terminal or window pane.
- Nothing stops one cockpit session from handling several projects. I just find it easier to context switch when they're different panes.
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
	<text class="muted small" x="90" y="160">project directory</text>
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
- The primary agent keeps the intent, the decisions and a short summary of each return. The raw logs stay with the sub-agents, so the primary's context doesn't fill up with noise.

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

## Fan-out, fold-in

That's what we call the approach.

- **Fan-out.** Split the work by outcome or by question, not by file count. Each piece gets a bounded scope, an output and a check. Pieces that don't touch the same files run in parallel.
- **Fold-in.** The primary agent reads the returns, reconciles what they assumed, and runs the combined thing itself.
- A sub-agent saying done is input, not acceptance.
- Tiny work skips all of this. The primary agent just does it.

## Progressive refinement

- First get the thinnest path working end to end, from the input to a result I can actually look at.
- No working path yet? Connect the missing pieces before polishing any of them.
- Working path? Look at the real result, close the biggest gap, then run the whole path again.
- Outline the whole, detail only the current round.
- Before each fan-out and after each fold-in, the primary agent notes which round this is, the pieces out, the returns in and the next action.
- Same gap keeps coming back? Change the approach, don't just retry.
- Stop when it's good enough for what I asked, not when it's perfect.

<figure class="diagram">
<svg viewBox="0 0 360 272" role="img" aria-label="Orient, divide, fan-out, fold-in, reassess. Reassess loops back to divide for the next refinement, or ends as complete, blocked or paused.">
	<defs><marker id="loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="60" y="10" width="140" height="30" rx="4"/>
	<text x="130" y="30">orient</text>
	<line x1="130" y1="40" x2="130" y2="58" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="60" width="140" height="30" rx="4"/>
	<text x="130" y="80">divide</text>
	<line x1="130" y1="90" x2="130" y2="108" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="110" width="140" height="30" rx="4"/>
	<text x="130" y="130">fan-out</text>
	<line x1="130" y1="140" x2="130" y2="158" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="160" width="140" height="30" rx="4"/>
	<text x="130" y="180">fold-in</text>
	<line x1="130" y1="190" x2="130" y2="208" marker-end="url(#loop-arrow)"/>
	<rect class="accent" x="60" y="210" width="140" height="30" rx="4"/>
	<text x="130" y="230">reassess</text>
	<path d="M60,225 H30 V75 H58" marker-end="url(#loop-arrow)"/>
	<text class="muted" x="22" y="150" transform="rotate(-90 22 150)">next refinement</text>
	<path d="M200,225 L253,193" marker-end="url(#loop-arrow)"/>
	<path d="M200,225 H253" marker-end="url(#loop-arrow)"/>
	<path d="M200,225 L253,257" marker-end="url(#loop-arrow)"/>
	<text class="accent" x="260" y="197" text-anchor="start">complete</text>
	<text x="260" y="229" text-anchor="start">blocked</text>
	<text x="260" y="261" text-anchor="start">paused</text>
</svg>
<figcaption>Only complete counts as success. A pause or a handoff is progress, not done.</figcaption>
</figure>

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
