---
type: Decision
title: Rails 6.1 floor
description: The gem supports Rails >= 6.1 and Ruby >= 2.5, so code must avoid APIs that only exist in newer Rails.
tags: [compatibility]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: gemspec
    title: rails-realtime-erd.gemspec
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/rails-realtime-erd.gemspec
---

# Decision

`rails >= 6.1.7.10`, `required_ruby_version >= 2.5.0`.[^gemspec] Any change must pass the Rails 6.1 gemfile before it is considered done.

# Why

The gem is a dev tool dropped into existing apps, many of them older. A floor this low maximises who can use it.

# Consequences

- Prefer guarded calls over newer APIs. Existing examples: `skip_forgery_protection if respond_to?(:skip_forgery_protection)` in `AssetsController`, `respond_to?(:schema_cache)` before clearing it, and the `module_parent_name` / `parent_name` fallback in [request lifecycle](/architecture/request-lifecycle.md).
- Ruby syntax must stay 2.5-compatible in `lib/` and `app/` (no endless methods, no pattern matching, no `it`).
- See the [multi-Rails test matrix](/operations/multi-rails-test-matrix.md) for how to verify it.
