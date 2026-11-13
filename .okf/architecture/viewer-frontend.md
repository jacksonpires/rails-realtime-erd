---
type: Component
title: Viewer frontend
description: Seven Stimulus controllers that filter, render, persist, copy, download and zoom the ERD entirely in the browser.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/javascript/rails_realtime_erd/application.js
tags: [frontend, stimulus, mermaid]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: appjs
    title: app/javascript/rails_realtime_erd/application.js
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/javascript/rails_realtime_erd/application.js
  - id: request-spec
    title: spec/rails-realtime-erd/requests/erd_controller_spec.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/spec/rails-realtime-erd/requests/erd_controller_spec.rb
---

# Overview

All controllers live in one plain script, `application.js`, registered on a global Stimulus application (no bundler, no importmap).[^appjs] They are attached together on one element: `data-controller="hash-state filter diagram clipboard download tab zoom-pan"` — the request spec asserts that exact string, so reordering or adding a controller means updating the spec.[^request-spec]

# Controllers

| Controller | Responsibility |
|---|---|
| `filter` | Owns UI state (selected models, option toggles, filter text, select all/none). Broadcasts `filter:changed` with the full state. |
| `diagram` | Parses `#rre-schema-data`, builds the `erDiagram` code on each `filter:changed`, calls `mermaid.render`, injects the SVG into `#rre-preview`. On render failure it shows the Mermaid error in the pane. |
| `hash-state` | Restores state from `location.hash` (base64 JSON) once the `filter` outlet connects; rewrites it with `history.replaceState` on every change. |
| `clipboard` | Copy URL / Mermaid / Markdown, reading code via the `diagram` outlet. |
| `download` | SVG / PNG export of the full-size diagram via the `diagram` outlet. |
| `tab` | ERD pane ↔ raw Mermaid code pane. |
| `zoom-pan` | Space/middle-click drag, wheel, pinch, on-screen buttons; applies `scale() translate()` to the zoom area. |

# Communication rules

Cross-controller traffic is only a document-level `filter:changed` CustomEvent plus Stimulus outlets — no shared store. The URL hash *is* the shareable state: a copied URL reproduces the exact selection and options, and the generated Mermaid embeds it as a `%% Restore Hash:` comment. Adding an option means adding it to **both** `restore` and `writeHash` in `hash-state`, or it silently won't survive a reload.

"Preview relations" includes any relation touching a selected model (Mermaid then draws the unselected neighbour as an empty box); with it off, only relations whose both ends are selected are drawn.

Mermaid runs with `securityLevel: "loose"` and a huge `maxTextSize` so large schemas render. Layout constraints are in [full-viewport shell](/decisions/full-viewport-shell.md); why no requests are made after load is in [client-side viewer](/decisions/client-side-viewer.md).
