---
title: "Our Agent Setup: One Owner, Many Workers"
date: "2026-10-26"
tags: ["ai", "programming"]
description: "I talk to one agent, it hands the work out to the rest, and a short agreement doc keeps all of them in line."
raw_at: "2026-10-26T19:10"
---

Some notes on how I run coding agents these days.

## One owner, many workers

Simply, I talk to one agent only. It's the communication point. It takes the request, splits it into pieces, hands each piece to a sub agent, then puts the results back together and reports to me.

<figure class="diagram">
<svg viewBox="0 0 360 270" role="img" aria-label="Me to the owner and back. The owner sends briefs to three workers inside the project checkout and gets returns back.">
	<defs><marker id="setup-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="140" y="10" width="80" height="30" rx="4"/>
	<text x="180" y="30">me</text>
	<line x1="165" y1="40" x2="165" y2="88" marker-end="url(#setup-arrow)"/>
	<line x1="195" y1="90" x2="195" y2="42" marker-end="url(#setup-arrow)"/>
	<text class="muted" x="158" y="68" text-anchor="end">request</text>
	<text class="muted" x="202" y="68" text-anchor="start">report</text>
	<rect class="accent" x="105" y="90" width="150" height="40" rx="4"/>
	<text x="180" y="108">owner</text>
	<text class="muted small" x="180" y="123">one per outcome</text>
	<rect class="dashed" x="10" y="165" width="340" height="95" rx="6"/>
	<line x1="160" y1="132" x2="72" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<line x1="180" y1="132" x2="180" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<line x1="200" y1="132" x2="288" y2="182" marker-start="url(#setup-arrow)" marker-end="url(#setup-arrow)"/>
	<text class="muted" x="108" y="152" text-anchor="end">brief</text>
	<text class="muted" x="252" y="152" text-anchor="start">return</text>
	<rect x="25" y="185" width="90" height="36" rx="4"/>
	<text x="70" y="207">worker</text>
	<rect x="135" y="185" width="90" height="36" rx="4"/>
	<text x="180" y="207">worker</text>
	<rect x="245" y="185" width="90" height="36" rx="4"/>
	<text x="290" y="207">worker</text>
	<text class="muted small" x="180" y="248">the project checkout</text>
</svg>
<figcaption>I only talk to the owner. Workers do their piece inside the project.</figcaption>
</figure>

I call the one I talk to the owner, and the sub agents workers. The owner keeps the intent, the decisions and a short summary of each result. The raw logs stay with the workers, so the owner's context doesn't fill up with noise.

A worker doesn't get the whole conversation, it gets a brief: the project path, what it's allowed to do, the piece it owns and how to report back. It returns something compact. What changed and where, what proves it, what's left, and one observation.

## The agreement

The other half is a short agreement doc that every agent reads. Just guardrails, nothing fancy.

- **Authority.** The project's own rules, my intent and what I've already allowed. The agreement itself grants nothing. Agents don't re-ask for things I already decided, and they only ask me when it's a new call that only I can make.
- **Harness native first.** Use what the tool already has, its subagents, task list, the forge, CI. If something is missing, do a manual step or say the limit. No new machinery.
- **Scope.** The request fixes what done is. Findings can change how we get there, never silently grow what we deliver.
- **Sizing.** Tiny work gets done directly, no plan, no worker. Bigger work gets split by outcome, not by file count.
- **Communication.** Outcomes and decisions, short. Bulky evidence stays where it lives and gets linked.
- **What done looks like.** A worker saying done is input, not acceptance. The owner runs the combined thing and checks the actual behavior before calling it done.
- **Continuity.** At a handoff or a pause, the owner writes a pickup note: the outcome, where things are, what's done and the proof, what's left and the next step. The next session starts from that note and the real files, not from memory.
- **Lessons.** Every return carries one observation, or "nothing material". Facts about the project go to the project. Lessons about the process become a proposed change to the agreement, never a silent rule change.

The owner runs the same loop every time.

<figure class="diagram">
<svg viewBox="0 0 360 272" role="img" aria-label="Orient, divide, dispatch, integrate, reassess. Reassess loops back to divide when there is a next step, or ends as complete, blocked or paused.">
	<defs><marker id="loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="60" y="10" width="140" height="30" rx="4"/>
	<text x="130" y="30">orient</text>
	<line x1="130" y1="40" x2="130" y2="58" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="60" width="140" height="30" rx="4"/>
	<text x="130" y="80">divide</text>
	<line x1="130" y1="90" x2="130" y2="108" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="110" width="140" height="30" rx="4"/>
	<text x="130" y="130">dispatch</text>
	<line x1="130" y1="140" x2="130" y2="158" marker-end="url(#loop-arrow)"/>
	<rect x="60" y="160" width="140" height="30" rx="4"/>
	<text x="130" y="180">integrate</text>
	<line x1="130" y1="190" x2="130" y2="208" marker-end="url(#loop-arrow)"/>
	<rect class="accent" x="60" y="210" width="140" height="30" rx="4"/>
	<text x="130" y="230">reassess</text>
	<path d="M60,225 H30 V75 H58" marker-end="url(#loop-arrow)"/>
	<text class="muted" x="22" y="150" transform="rotate(-90 22 150)">next</text>
	<path d="M200,225 L253,193" marker-end="url(#loop-arrow)"/>
	<path d="M200,225 H253" marker-end="url(#loop-arrow)"/>
	<path d="M200,225 L253,257" marker-end="url(#loop-arrow)"/>
	<text class="accent" x="260" y="197" text-anchor="start">complete</text>
	<text x="260" y="229" text-anchor="start">blocked</text>
	<text x="260" y="261" text-anchor="start">paused</text>
</svg>
<figcaption>Only complete counts as success. A pause or a handoff is progress, not done.</figcaption>
</figure>

## Staying focused

Some rules exist only because current models slip. They drift into cleanup nobody asked for, call it done from a green check, or guess the contents of a file they couldn't read. I tag those rules as shims, like `[shim:scope]`. When a new model comes out, I rerun the checks with the shim removed, and after three clean runs the rule goes. The rest, authority, scope and what done means, stay no matter how good the models get.

It's all just markdown, no runtime. More notes as it changes.
