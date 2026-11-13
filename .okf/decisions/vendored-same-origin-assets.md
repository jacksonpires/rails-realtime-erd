---
type: Decision
title: Vendored same-origin assets
description: Stimulus and Mermaid are vendored in the gem and served from the engine's own route instead of a CDN, so the viewer works under strict Content Security Policy.
tags: [frontend, csp, host-isolation]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T15:00:00Z
sources:
  - id: css
    title: erd.css header comment
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/assets/stylesheets/rails_realtime_erd/erd.css
---

# Decision

All JS is vendored under `app/javascript/rails_realtime_erd/vendor/` and served same-origin by `AssetsController`; CSS is a hand-written utility subset inlined in the page. No CDN is used.[^css]

# Why

Hosts with a strict CSP (`script-src 'self'`) block CDN scripts and inline scripts, which leaves a blank viewer. Same-origin `<script src>` passes `'self'`. It also makes the viewer work offline, and pins Mermaid/Stimulus versions so a CDN release can't break rendering.

# Consequences

- The gem ships a large `mermaid.js`; upgrades are a manual file replacement.
- The request spec asserts the three same-origin `src` URLs — that test *is* the guard for this decision.
- The CSS can only use classes defined in `erd.css`; a new Tailwind class in an ERB view does nothing until it is added there.

The mechanics are in [asset delivery](/architecture/asset-delivery.md).
