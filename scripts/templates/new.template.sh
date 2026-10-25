#!/bin/sh
set -eu

cat <<EOF > "./content/blog/${POST_TITLE}.md"
---
title: "${POST_TITLE}"
date: "${POST_DATE}"
tags: []
---

EOF
