---
title: "Fan-Out, Fold-In, Refine"
date: "2026-10-26"
tags: ["ai", "programming"]
extends: "our-agent-setup"
description: "The loop our primary agent runs: hand the work out, fold it back in, refine breadth first, and keep the loop in the harness's own task list."
raw_at: "2026-10-26T19:50"
---

This is the loop our primary agent runs inside [our agent setup](/blog/our-agent-setup/). Same deal, take the ideas, not the recipe.

## Fan-out, fold-in

- **Fan-out.** The primary agent splits the work by outcome or by question, not by file count.
  - Each piece gets a bounded scope, an output and a check.
  - Pieces that don't touch the same files run in parallel.
- **Fold-in.** The primary agent reads the returns and reconciles what they assumed.
  - Then it runs the combined thing itself.
  - A sub-agent saying done is input, not acceptance.
- Tiny work skips all of this. The primary agent just does it.

## Progressive refinement

- **Breadth first.** The first pass is a thin slice across the whole path, from the input to a result I can actually look at. Not one area done deep.
- **Depth comes from refining.** Each round looks at the real result, closes the biggest gap, then runs the whole path again.
- No working path yet? Connect the missing pieces before polishing any of them.
- Outline the whole, detail only the current round.
- Stop when it's good enough for what I asked, not when it's perfect.

<figure class="diagram">
<svg viewBox="0 0 360 170" role="img" aria-label="Three refinements across the same path from input to result. The first is a thin bar across the whole width; each later one is thicker.">
	<defs><marker id="refine-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
	<text class="muted" x="60" y="20" text-anchor="start">input</text>
	<text class="muted" x="340" y="20" text-anchor="end">result</text>
	<line x1="60" y1="30" x2="338" y2="30" marker-end="url(#refine-arrow)"/>
	<text x="48" y="57" text-anchor="end">1st</text>
	<rect class="solid" x="60" y="50" width="280" height="6"/>
	<text x="48" y="91" text-anchor="end">2nd</text>
	<rect class="solid" x="60" y="80" width="280" height="16"/>
	<text x="48" y="131" text-anchor="end">3rd</text>
	<rect class="solid" x="60" y="114" width="280" height="28"/>
	<text class="muted small" x="200" y="162">the whole path every round, deeper each time</text>
</svg>
<figcaption>Breadth first. Depth comes from the next refinement, not from finishing one area.</figcaption>
</figure>

## The loop

Put together, the primary agent runs the same loop every time.

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

- **Orient.** What was asked, how we'll know it's done, what we're allowed to do.
- **Divide** and **fan-out**, then **fold-in**.
- **Reassess.** One of four:
  - complete, the outcome is shown working
  - next, there's a gap and we're allowed to close it, so loop again
  - blocked, there's no allowed way forward, so say what's needed
  - paused, I stopped it or we're waiting, so leave a pickup note

## The task list stopgap

- Sometimes they forget. Long loops slip: the agent loses which round it's on, drops a piece, redoes finished work, or stops at the first thin slice.
- So we make the primary agent keep the loop in the harness's own todo or task list. No new tool.
- The shape, roughly:
  - the root is the intent
  - under it, the thin slice for this pass, across the whole path
  - the refinement number
  - the pieces out, and the returns in
  - the assessment, loop again or end
- It gets updated before each fan-out and after each fold-in.
- Same gap keeps coming back? Change the approach, don't just retry.
- It's a shim. The idea is to drop it once the models stop forgetting.

```text
intent: what was asked, and how we'll know it's done
  refinement 2
    [x] thin slice, input to result
    [ ] biggest gap from the last look
    [ ] fold-in, run the whole path again
    [ ] assess: loop again, or end
```
