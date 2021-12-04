---
title: "Frameworks and CMSs"
date: "2021-12-04"
author: "Odee"
tags: draft
time: 2
---

For the last post of the day, i'd like to make a list of my favorite CMSs. 
I have not tried many, but below I had fun with


- [strapi](https://strapi.io/) [React + mongo] + [GQL + REST] -> direction is to Prisma
- [keystone](https://keystonejs.com/) [React + prisma] + [GQL + REST]
- [directus](https://directus.io/) [Vue + Knex] + [GQL + REST]

Some key notes include,  
Mongo support for *Prisma* is still in preview.

These are the notable CMSs I have tried and you can see a pattern here
* React or Vue acts as the **Presenter**
* GQL and REST for **transport**; and  
* Prisma, Knex, or Mongoose + some other ORMs to handle **persistence**

*I think we have one last piece missing to complete above, some form of business logic abstraction hmmm*

Also, some frameworks that are being evaluated recently for use of our team includes

- [blitzjs](https://blitzjs.com/)
- [redwoodjs](https://redwoodjs.com/)
- [the ol' nestjs](https://nestjs.com/)


Also also, I heard [Rich Harris is now with Vercel](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte) 
to work on Svelte full-time! Hell yeah! Exciting times ahead.


Last note: Maybe a closing thought about 2021 and some thoughts for 2022 would be a nice post, take about web3 and other things to come? hmmm

