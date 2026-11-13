---
type: Decision
title: Dev dependencies in Gemfiles
description: sqlite3, rspec-rails and standard are declared in the root Gemfile and gemfiles/*.gemfile, never as gemspec development dependencies.
tags: [compatibility, testing]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: gemspec
    title: rails-realtime-erd.gemspec
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/rails-realtime-erd.gemspec
---

# Decision

The gemspec declares only the runtime dependency `rails >= 6.1.7.10`. Development dependencies live in each Gemfile of the [test matrix](/operations/multi-rails-test-matrix.md).[^gemspec]

# Why

Every matrix Gemfile calls `gemspec`, so a dev dependency pinned there applies to *all* of them. The Rails versions need incompatible sqlite3 lines — Rails 8 needs sqlite3 >= 2.1, Rails 6.1 needs 1.x — so no single pin can satisfy the matrix.

# Consequences

When adding a dev tool, add it to every Gemfile under `gemfiles/` and the root `Gemfile`.
