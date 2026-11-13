---
type: Decision
title: Standalone layout
description: The engine renders in its own layout and never inside the host app's layout.
tags: [frontend, host-isolation]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: claude-md
    title: CLAUDE.md (Conventions)
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/CLAUDE.md
---

# Decision

`ErdController` uses `layout "rails_realtime_erd/application"`, a complete HTML document of its own. Never switch it to the host's `"application"` layout.[^claude-md]

# Why

Host layouts load Turbo, their own Stimulus application, global CSS and CSP rules. Inside them the viewer's controllers can double-register, Turbo can intercept navigation, and host CSS can restyle the panes — and these conflicts are **silent**: the page renders, just wrong, and only in some hosts. A standalone layout makes the viewer behave identically everywhere.

# Consequences

The engine must bring all its own assets (see [asset delivery](/architecture/asset-delivery.md)) and cannot reuse host styling or auth helpers.
