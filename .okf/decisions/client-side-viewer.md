---
type: Decision
title: Client-side viewer
description: After the initial page load, every viewer interaction is local Stimulus state; there are no server round-trips per click.
tags: [frontend, stimulus, realtime]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: claude-md
    title: CLAUDE.md (Conventions)
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/CLAUDE.md
---

# Decision

The server's job ends with embedding the schema JSON. Selecting models, toggling options, filtering, zooming, copying and downloading are all handled in the browser. Don't add Turbo Frames or fetches per checkbox.[^claude-md]

# Why

The schema is small enough to ship whole, and rebuilding it is the expensive part (eager load + per-table introspection, see [request lifecycle](/architecture/request-lifecycle.md)). Local state keeps toggling instant and lets the full state live in the URL hash, which makes any view shareable by link.

# Consequences

"Realtime" means *refresh the page* to pick up schema changes; there is no live push. State that must survive a reload goes in the hash (see [viewer frontend](/architecture/viewer-frontend.md)).
