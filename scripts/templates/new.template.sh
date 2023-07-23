#!/bin/bash

cat >./data/blog/${POST_TITLE}.mdx <<EOF
---
title: ${POST_TITLE}
date: ${POST_DATE}
tags: []
draft: true
summary: ${POST_TITLE}
---

hello world
EOF
