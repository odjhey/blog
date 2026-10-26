---
title: "Fan-Out, Fold-In, Refine"
date: "2026-10-26T19:50"
tags: ["ai", "programming"]
extends: "our-agent-setup"
description: "The loop our primary agent runs: a thin slice first, fan it out, fold it back in, refine breadth first, and keep the loop in the harness's own task list."
raw_at: "2026-10-26T19:50"
---

This is the loop our primary agent runs inside [our agent setup](/blog/our-agent-setup/).

## Slices

- A slice is a small one. Broad strokes, breadth first, depth later. Thin slices until refined.

## Fan-out, fold-in

- **Fan-out.** The primary agent splits the work by outcome or by question, not by file count, not by files touched, we accept conflicts.
  - Each piece gets a bounded scope, an output and a check.
  - Sometimes we fan-out and allow competing ideas as well, then fold-in and see the winner, arena style.
- **Fold-in.** An agent reads the returns and reconciles what they assumed.
  - It runs the combined thing itself.
  - A sub-agent saying done is input, not acceptance.
- Tiny work skips all of this. The primary agent just does it.

## Progressive refinement

- **Breadth first.** The first pass is a thin slice across the whole path, from the input to a result I can actually look at and use. Not one area done deep.
- **Depth comes from refining.** Each round looks at the real result, closes the biggest gap, then runs the whole path again.
- We allow discovery from each slice. What one slice turns up can reshape the next.
- No working path yet? Connect the missing pieces before polishing any of them.
- Outline the whole, detail only the current round.
- Stop when it's good enough for what I asked, not when it's perfect.
- The same idea could apply to [studying other things](/blog/learning-japanese-the-strategy/), broad strokes before details.

<figure class="diagram">
<svg viewBox="0 0 360 150" role="img" aria-label="A grid of four parts from input to result, three rounds deep. The first round is a thin slice across all four parts; the later rounds go deeper across the same parts.">
	<defs><marker id="refine-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<text class="muted" x="50" y="20" text-anchor="start">input</text>
	<text class="muted" x="270" y="20" text-anchor="end">result</text>
	<line x1="50" y1="30" x2="268" y2="30" marker-end="url(#refine-arrow)"/>
	<text x="42" y="60" text-anchor="end">1st</text>
	<rect class="solid" x="50" y="45" width="51" height="22"/>
	<rect class="solid" x="106" y="45" width="51" height="22"/>
	<rect class="solid" x="162" y="45" width="51" height="22"/>
	<rect class="solid" x="218" y="45" width="51" height="22"/>
	<text class="accent" x="282" y="60" text-anchor="start">thin slice</text>
	<text x="42" y="90" text-anchor="end">2nd</text>
	<rect class="dashed" x="50" y="75" width="51" height="22"/>
	<rect class="dashed" x="106" y="75" width="51" height="22"/>
	<rect class="dashed" x="162" y="75" width="51" height="22"/>
	<rect class="dashed" x="218" y="75" width="51" height="22"/>
	<text x="42" y="120" text-anchor="end">3rd</text>
	<rect class="dashed" x="50" y="105" width="51" height="22"/>
	<rect class="dashed" x="106" y="105" width="51" height="22"/>
	<rect class="dashed" x="162" y="105" width="51" height="22"/>
	<rect class="dashed" x="218" y="105" width="51" height="22"/>
	<line x1="288" y1="75" x2="288" y2="125" marker-end="url(#refine-arrow)"/>
	<text class="muted" x="298" y="105" text-anchor="start">refine</text>
	<text class="muted small" x="160" y="145">every part in the first slice, deeper each round</text>
</svg>
<figcaption>Breadth first. Depth comes from refining, not from finishing one area.</figcaption>
</figure>

## The loop

Put together, the primary agent runs the same loop every time.

<figure class="diagram">
<svg viewBox="0 0 360 272" role="img" aria-label="Orient, thin slice, fan-out, fold-in, reassess. Reassess loops back to the next thin slice, or ends as complete, blocked or paused.">
	<defs><marker id="loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<rect x="60" y="10" width="140" height="30" rx="4"/>
	<text x="130" y="30">orient</text>
	<line x1="130" y1="40" x2="130" y2="58" marker-end="url(#loop-arrow)"/>
	<rect class="accent" x="60" y="60" width="140" height="30" rx="4"/>
	<text x="130" y="80">thin slice</text>
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

- **Orient.** What was asked, how we'll know it's done, what we're allowed to do.
- **Thin slice**, then **fan-out**, then **fold-in**.
- **Reassess.** One of four:
  - complete, the outcome is shown working
  - next, there's a gap and we're allowed to close it, so loop again
  - blocked, there's no allowed way forward, so say what's needed
  - paused, I stopped it or we're waiting, so leave a pickup note

## The task list stopgap

- Sometimes they forget. Long loops slip: compaction drops things, the agent loses which round it's on, drops a piece, redoes finished work, or stops at the first thin slice.
- So we make the primary agent keep the loop in the harness's own todo or task list. No new tool.
- The shape, roughly:
  - the root is the intent
  - under it, the thin slice for this pass, across the whole path
  - the refinement number
  - the pieces out, and the returns in
  - the assessment, loop again or end
- It gets updated before each fan-out and after each fold-in.
- Same gap keeps coming back? Change the approach, don't just retry.
- It's a shim. We could drop it when models stop forgetting.

```text
intent: what was asked, and how we'll know it's done
  refinement 2
    [x] thin slice, input to result
    [ ] biggest gap from the last look
    [ ] fold-in, run the whole path again
    [ ] assess: loop again, or end
```
