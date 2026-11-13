---
type: Component
title: Builder
description: Introspects ActiveRecord::Base.descendants into a Models list and a merged Relations list for Mermaid.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/builder.rb
tags: [builder, mermaid, upstream-port]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T15:00:00Z
sources:
  - id: builder
    title: lib/rails-realtime-erd/builder.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/builder.rb
  - id: upstream
    title: koedame/rails-mermaid_erd (original Builder)
    resource: https://github.com/koedame/rails-mermaid_erd
  - id: builder-spec
    title: spec/rails-realtime-erd/builder/model_data_spec.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/spec/rails-realtime-erd/builder/model_data_spec.rb
---

# Overview

`RailsRealtimeErd::Builder.model_data` is ported almost verbatim from the `rails-mermaid_erd` Builder.[^upstream] Keeping it close to upstream is deliberate: fixes there can be diffed and pulled in. The local addition is the **model filter**, plus the line-style checks in the `belongs_to` and HABTM reverse lookups (see [relation merging](/architecture/relation-merging.md)).[^builder]

# Model filter

A descendant is skipped when any of these hold: its table does not exist; it is anonymous; its name contains `HABTM_` (Rails' generated join classes); its `table_name` is blank; it is an `abstract_class`; or its name starts with `ActiveRecord::`, `ActiveStorage::`, `ActionText::` or `ActionMailbox::`. New framework namespaces that should be hidden go in this list.

# What it extracts

- Per model: table name, table comment, model name, and columns. Each column carries the abstract Rails `type` **and** the raw `sql_type`; the viewer chooses between them (see [schema JSON contract](/architecture/schema-json-contract.md)).
- Key tagging: `PK` from `model.primary_key`; `FK` only when a **database** foreign-key constraint exists (`connection.foreign_keys`). A `*_id` column with no FK constraint is not tagged — this surprises users of apps that never add FK constraints.
- Relations: one entry per *pair* of associated models, not per association — see [relation merging](/architecture/relation-merging.md).

`get_reflection_model_name` is the single place that resolves an association's target (`class_name:` → `through:` + `source:` → `reflection.class_name`). Every relation depends on it.

The regression net is `model_data_spec.rb`, which pins the exact Models and Relations for the dummy app.[^builder-spec] On SQLite it expects empty comments — see [SQLite comment limitation](/operations/sqlite-comment-limitation.md).
