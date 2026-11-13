---
type: Component
title: Asset delivery
description: CSS is inlined into the layout and vendored JS is served by an engine controller, so the viewer works with any host asset pipeline and under strict CSP.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/controllers/rails_realtime_erd/assets_controller.rb
tags: [frontend, csp, host-isolation]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: assets-controller
    title: app/controllers/rails_realtime_erd/assets_controller.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/controllers/rails_realtime_erd/assets_controller.rb
  - id: layout
    title: app/views/layouts/rails_realtime_erd/application.html.erb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/views/layouts/rails_realtime_erd/application.html.erb
  - id: css
    title: app/assets/stylesheets/rails_realtime_erd/erd.css
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/assets/stylesheets/rails_realtime_erd/erd.css
---

# Overview

The engine ships its own assets and never relies on Sprockets, Propshaft or importmap.[^layout]

| Asset | Delivery |
|---|---|
| `erd.css` | Inlined in a `<style>` tag via `inline_stylesheet` (`File.read` at render time). It is a hand-written subset of Tailwind-style utilities — only the classes the ERB views use — not Tailwind itself.[^css] |
| `vendor/stimulus.js` (Stimulus 3.2.1), `vendor/mermaid.js`, `application.js` | Served same-origin from `<mount_path>/assets/:name` by `AssetsController` as `text/javascript`. |

`AssetsController` serves only names in a frozen `ASSETS` allow-list (anything else → 404), so the route can't be used to read arbitrary engine files. It sends `Cache-Control: private, max-age=300` and `X-Content-Type-Options: nosniff`, and skips CSRF protection (plain GET JS).[^assets-controller]

Adding a new JS file means adding it to `ASSETS`, a `<script>` in the layout, and a request-spec example. Upgrading Mermaid or Stimulus means replacing the vendored file. The rationale is in [vendored same-origin assets](/decisions/vendored-same-origin-assets.md).

The helper still has `inline_javascript`, but the layout no longer uses it for JS.
