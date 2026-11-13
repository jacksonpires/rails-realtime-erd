---
type: Decision
title: Full-viewport shell
description: The viewer is an h-screen flex column whose page never scrolls; only the sidebar and panes scroll internally.
tags: [frontend]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: changelog
    title: CHANGELOG.md 0.2.0 (PR #4)
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/CHANGELOG.md
---

# Decision

`#rre-app` is an `h-screen` flex column: header and footer `flex-none`, middle row `flex-1 min-h-0`, sidebar `overflow-y-auto`, ERD/Code panes `flex-1 min-h-0`. The page itself never scrolls, however many models the host has. Introduced in 0.2.0.[^changelog]

# Why

Before 0.2.0, heights were `calc(100vh - …px)`. That hard-coded header/footer sizes, and a long model list pushed the page past the window, dragging the zoom controls off-screen. The `min-h-0` on flex children is what lets them shrink below their content height — removing it brings the bug back.

# Rendering rule

The SVG is fitted inside the pane on render (`max-width`/`max-height: 100%`, never upscaled), and `#rre-preview` has bottom padding so the diagram clears the overlaid movement/zoom hint bar. SVG/PNG downloads still export the full-size diagram.

Don't reintroduce `calc(100vh - …)` heights.
