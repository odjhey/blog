---
title: "A Desk, Not a Dispatcher"
date: "2026-10-26T20:01"
tags: ["ai", "programming"]
extends: "our-agent-setup"
description: "How requests from chat and pull requests reach our agents: a shared board they pull from, quiet waiting, small honest reports, and people keeping the authority."
raw_at: "2026-10-26T20:01"
---

We have recently started using a desk, to put several machines to work, minis and linux boxes inside a tailnet. Requests come in where the team already talks, in chat threads and pull requests.

## The desk

- Every request lands on a desk, a small shared board, triaged (Jev).
- It records what was asked, who is working on it, and what came back.
- The desk doesn't run agents and doesn't decide how the work is done.

<figure class="diagram">
<svg viewBox="0 0 360 230" role="img" aria-label="People post requests from chat and pull requests to the desk as one request card. Machine A and machine B, each a coordinator plus agents, pull from the desk and claim what fits.">
	<defs><marker id="desk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="120" y="10" width="120" height="40" rx="4"/>
	<text x="180" y="27">people</text>
	<text class="muted small" x="180" y="42">chat, PRs</text>
	<line x1="180" y1="52" x2="180" y2="88" marker-start="url(#desk-arrow)" marker-end="url(#desk-arrow)"/>
	<text class="muted small" x="188" y="74" text-anchor="start">one request card</text>
	<rect class="accent" x="120" y="90" width="120" height="40" rx="4"/>
	<text x="180" y="107">desk</text>
	<text class="muted small" x="180" y="122">board + ledger</text>
	<line x1="90" y1="180" x2="158" y2="133" marker-end="url(#desk-arrow)"/>
	<line x1="270" y1="180" x2="202" y2="133" marker-end="url(#desk-arrow)"/>
	<text class="muted small" x="180" y="164">claim what fits</text>
	<rect x="20" y="180" width="140" height="40" rx="4"/>
	<text x="90" y="197">machine a</text>
	<text class="muted small" x="90" y="212">coordinator + agents</text>
	<rect x="200" y="180" width="140" height="40" rx="4"/>
	<text x="270" y="197">machine b</text>
	<text class="muted small" x="270" y="212">coordinator + agents</text>
</svg>
<figcaption>People talk to the desk. Machines pull from it.</figcaption>
</figure>

## Pulled, never pushed

- Every request becomes a quest card with what's wanted, the access it needs and a few criteria anyone can check.
- Each machine runs a coordinator that spawns agents and do work.
- The coordinator looks at the board, claims what it can actually finish, and add a reason for the skips.
- The desk doesn't assign work. A machine that's busy, offline or not suited simply doesn't take it.

<figure class="diagram">
<svg viewBox="0 0 360 200" role="img" aria-label="A quest card with what's wanted, the access it needs, criteria marked met, partly met or not yet, who claimed it, progress lines and a short reply.">
	<rect class="accent" x="50" y="8" width="260" height="186" rx="6"/>
	<text class="muted small" x="66" y="30" text-anchor="start">quest card</text>
	<text class="muted" x="66" y="54" text-anchor="start">wanted</text>
	<text x="150" y="54" text-anchor="start">the ask, one line</text>
	<text class="muted" x="66" y="74" text-anchor="start">access</text>
	<text x="150" y="74" text-anchor="start">what it must touch</text>
	<text class="muted" x="66" y="94" text-anchor="start">criteria</text>
	<text x="150" y="94" text-anchor="start">[x] met</text>
	<text x="150" y="110" text-anchor="start">[~] partly met</text>
	<text x="150" y="126" text-anchor="start">[ ] not yet</text>
	<text class="muted" x="66" y="146" text-anchor="start">claimed</text>
	<text x="150" y="146" text-anchor="start">machine a</text>
	<text class="muted" x="66" y="166" text-anchor="start">progress</text>
	<text x="150" y="166" text-anchor="start">a line as it goes</text>
	<text class="muted" x="66" y="184" text-anchor="start">reply</text>
	<text x="150" y="184" text-anchor="start">short, at the end</text>
</svg>
<figcaption>One card per request, updated in place.</figcaption>
</figure>

<figure class="diagram">
<svg viewBox="0 0 360 290" role="img" aria-label="A card starts open. A machine claims it, works it and replies. A machine can pass it back to open with a reason. If nobody can do it, it closes with the reasons.">
	<defs><marker id="card-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="60" y="10" width="140" height="30" rx="4"/>
	<text x="130" y="30">open</text>
	<line x1="200" y1="25" x2="228" y2="25" marker-end="url(#card-arrow)"/>
	<rect x="230" y="5" width="120" height="40" rx="4"/>
	<text x="290" y="22">closed</text>
	<text class="muted small" x="290" y="37">with reasons</text>
	<text class="muted small" x="290" y="62">when nobody can</text>
	<line x1="130" y1="40" x2="130" y2="108" marker-end="url(#card-arrow)"/>
	<text class="muted small" x="138" y="78" text-anchor="start">a machine claims it</text>
	<rect x="60" y="110" width="140" height="30" rx="4"/>
	<text x="130" y="130">claimed</text>
	<path d="M60,125 H30 V25 H58" marker-end="url(#card-arrow)"/>
	<text class="muted small" x="22" y="75" transform="rotate(-90 22 75)">passed on</text>
	<line x1="130" y1="140" x2="130" y2="178" marker-end="url(#card-arrow)"/>
	<rect x="60" y="180" width="140" height="30" rx="4"/>
	<text x="130" y="200">working</text>
	<text class="muted small" x="208" y="199" text-anchor="start">progress lines</text>
	<line x1="130" y1="210" x2="130" y2="248" marker-end="url(#card-arrow)"/>
	<rect class="accent" x="60" y="250" width="140" height="30" rx="4"/>
	<text x="130" y="270">replied</text>
	<text class="muted small" x="208" y="269" text-anchor="start">a short answer</text>
</svg>
<figcaption>Passing on needs a reason. Closing with reasons beats silence.</figcaption>
</figure>

## Waiting costs nothing

- Coordinators don't burn model turns watching for work.
- Small background processes do the waiting. They wake the coordinator only when something real happens, like a claim, a message or a finished task.
- A wake is just a hint. The coordinator always re-reads the desk before acting, so a duplicate or late notification never repeats work.

<figure class="diagram">
<svg viewBox="0 0 360 262" role="img" aria-label="A claim, a message or a finished task reaches a small watcher. The watcher wakes the coordinator with a hint. The coordinator re-reads the desk, then acts.">
	<defs><marker id="wake-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<text class="muted small" x="180" y="14">a claim, a message, a finished task</text>
	<line x1="180" y1="20" x2="180" y2="38" marker-end="url(#wake-arrow)"/>
	<rect x="100" y="40" width="160" height="40" rx="4"/>
	<text x="180" y="57">watcher</text>
	<text class="muted small" x="180" y="72">no model turns</text>
	<line x1="180" y1="80" x2="180" y2="108" marker-end="url(#wake-arrow)"/>
	<text class="muted small" x="188" y="98" text-anchor="start">wake, just a hint</text>
	<rect x="100" y="110" width="160" height="30" rx="4"/>
	<text x="180" y="130">coordinator</text>
	<line x1="180" y1="140" x2="180" y2="168" marker-end="url(#wake-arrow)"/>
	<rect class="accent" x="100" y="170" width="160" height="30" rx="4"/>
	<text x="180" y="190">re-read the desk</text>
	<line x1="180" y1="200" x2="180" y2="228" marker-end="url(#wake-arrow)"/>
	<rect x="100" y="230" width="160" height="30" rx="4"/>
	<text x="180" y="250">act, or nothing to do</text>
</svg>
<figcaption>A duplicate or late wake reads the same desk, so nothing repeats.</figcaption>
</figure>

## Small, honest reports

- Agents report as they go. A progress line, a criterion met or partly met, a link to what they produced.
- People see one card that updates in place.
- Every request ends with a short reply.
- When nobody can do something, the request closes with the reasons. That's more useful than silence.

## Anything can restart

- The desk holds the state.
- A coordinator can crash, cool down or move to another machine, and the next one picks up from the record.

<figure class="diagram">
<svg viewBox="0 0 360 80" role="img" aria-label="A coordinator that crashed wrote to the desk. A new coordinator on any machine reads the desk and picks up.">
	<defs><marker id="restart-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect class="dashed" x="5" y="25" width="95" height="40" rx="4"/>
	<text class="muted" x="52" y="42">coordinator</text>
	<text class="muted small" x="52" y="57">crashed</text>
	<line x1="100" y1="45" x2="131" y2="45" marker-end="url(#restart-arrow)"/>
	<text class="muted small" x="117" y="18">record</text>
	<rect class="accent" x="133" y="25" width="94" height="40" rx="4"/>
	<text x="180" y="42">desk</text>
	<text class="muted small" x="180" y="57">holds the state</text>
	<line x1="227" y1="45" x2="258" y2="45" marker-end="url(#restart-arrow)"/>
	<text class="muted small" x="243" y="18">read</text>
	<rect x="260" y="25" width="95" height="40" rx="4"/>
	<text x="307" y="42">coordinator</text>
	<text class="muted small" x="307" y="57">picks up</text>
</svg>
<figcaption>The state lives on the desk, not in any one coordinator.</figcaption>
</figure>

## Suprisingly

How little of this needs to be clever. The biggest gains came from plain plumbing:

- the right context on each request
- criteria anyone can check
- honest "I can't do this" answers
- quiet notifications

Better models helped less than that.
