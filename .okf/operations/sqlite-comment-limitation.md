---
type: Concept
title: SQLite comment limitation
description: The dummy app uses SQLite, which drops table and column comments, so specs expect empty comments; this is not a Builder bug.
tags: [testing, gotcha]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: builder-spec
    title: spec/rails-realtime-erd/builder/model_data_spec.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/spec/rails-realtime-erd/builder/model_data_spec.rb
---

# Overview

`spec/dummy` declares table and column comments in its schema, but SQLite does not store them. The [Builder](/architecture/builder.md) spec therefore asserts `comment: nil` and `TableComment: ""`.[^builder-spec]

The Builder forwards whatever `column.comment` and `connection.table_comment` return, so on Postgres and MySQL comments do round-trip into the ERD. Don't add adapter-specific code to the Builder to make the spec "match" the schema, and don't "fix" the spec to expect comments.

Testing comment rendering for real would need a Postgres/MySQL job in the [test matrix](/operations/multi-rails-test-matrix.md), which does not exist today.
