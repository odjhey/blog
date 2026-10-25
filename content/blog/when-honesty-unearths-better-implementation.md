---
title: "When Honesty Unearths Better Implementation"
date: "2024-07-01"
tags: ["programming", "application-design"]
description: "Being honest with our variable names keeps leading me to better implementations."
---

one time, we were talking about how to correctly name a function, the function in question checks the value and mutates it to null if certain conditions are met, like a reset

now the intent of this function is to make sure a value getting retrieved is always up to date, it was initially named as `get`, and of course this has "that smell", [a `get` that mutates, something doesn't feel right](/blog/expanding-on-3-coupling-of-a-traditional-object/).

so we continued the conversation, and pointed out that naming this function `get` is a little "dishonest", as it has some mutations, after some more back and forth, we settled with an implementation where the mutation was removed, and we concluded that setting it to null is not necessary and we just need to update some condition where we plan on using that function.

above is a little unclear, need to include an example siguro, the field was initially called `syncedAt`, and after our conversations, we realized it's not fully honest, because it should have been named `syncAttemptedAt`, now it's more clear and ... cont

anyways, the one i wanted to tell here is that striving to be honest with our variable naming leads us to better implementation, and i think this is not limited to variable names, i frequently find myself realizing better solutions every time i sit and think about whether my "program" is being honest
