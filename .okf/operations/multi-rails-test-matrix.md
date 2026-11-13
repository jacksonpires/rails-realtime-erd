---
type: Runbook
title: Multi-Rails test matrix
description: How to run the spec suite against each supported Rails version, and which Ruby versions pair with which Rails.
tags: [compatibility, testing]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: ci
    title: .github/workflows/ci.yml
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/.github/workflows/ci.yml
---

# Overview

The root `Gemfile` targets the latest Rails (8.1, Ruby >= 3.2). Each older Rails minor has `gemfiles/rails_<x>_<y>.gemfile`. CI runs each Rails minor on its oldest and newest supported Ruby, plus a StandardRb lint job on Ruby 4.0.[^ci]

# Steps

```bash
bundle exec rspec                                             # Rails 8.1
BUNDLE_GEMFILE=gemfiles/rails_6_1.gemfile bundle install
BUNDLE_GEMFILE=gemfiles/rails_6_1.gemfile bundle exec rspec   # Rails 6.1 (Ruby <= 3.3)
bundle exec standardrb
```

# Pairings (CI)

| Rails | Ruby tested |
|---|---|
| 6.1 | 3.0, 3.3 |
| 7.0 | 3.1, 3.4 |
| 7.1 | 3.2, 4.0 |
| 7.2 | 3.3, 4.0 |
| 8.0 | 3.2, 4.0 |
| 8.1 | 3.2, 4.0 |

# Gotchas

- Rails 6.1 does not load on Ruby >= 3.4: `bigdecimal` stopped being a default gem.
- Use rbenv/asdf/mise Ruby, not macOS system Ruby 2.6 — that universal binary makes Bundler build x86_64 native gems (`incompatible architecture`).
- The README "Compatibility" table mirrors the CI matrix; change both together.
- Why dev gems are per-Gemfile: [dev dependencies in Gemfiles](/decisions/dev-deps-in-gemfiles.md). Why 6.1 matters: [Rails 6.1 floor](/decisions/rails-6-1-floor.md).
