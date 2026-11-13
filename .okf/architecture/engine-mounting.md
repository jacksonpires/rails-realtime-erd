---
type: Component
title: Engine mounting
description: The engine auto-mounts itself into the host's routes at a configurable path, only in allowed environments.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/engine.rb
tags: [configuration, security]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: engine
    title: lib/rails-realtime-erd/engine.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/engine.rb
  - id: config
    title: lib/rails-realtime-erd/configuration.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/configuration.rb
---

# Overview

`RailsRealtimeErd::Engine` is an isolated-namespace `Rails::Engine`. Its `rails_realtime_erd.auto_mount` initializer **appends** a `mount` to the host's routes, so the host never has to edit `config/routes.rb`.[^engine] Because it appends, a host catch-all route declared earlier will shadow `/rails/erd`; such hosts should set `auto_mount = false` and mount the engine manually above their catch-all.

The mount is skipped unless both gates pass: `auto_mount` is true and `Rails.env` is in `enabled_environments`. That gate is the gem's only protection against exposing the schema in production — there is no authentication on the route.

# Schema

Configured via `RailsRealtimeErd.configure { |c| ... }`, read once at boot by the initializer.[^config]

| Setting | Default | Effect |
|---|---|---|
| `mount_path` | `"/rails/erd"` | Where the engine is mounted; asset URLs follow it (`<mount_path>/assets/:name`). |
| `auto_mount` | `true` | When false, the host mounts the engine itself. |
| `enabled_environments` | `%w[development test]` | Compared as strings against `Rails.env`. |

Engine routes are `root → erd#show` and `assets/:name → assets#show`; see [asset delivery](/architecture/asset-delivery.md) and the [request lifecycle](/architecture/request-lifecycle.md).
