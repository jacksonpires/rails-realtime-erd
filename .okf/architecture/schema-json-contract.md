---
type: Data Contract
title: Schema JSON contract
description: The Models/Relations JSON the Builder emits, embedded in the page and consumed by the Stimulus viewer.
tags: [builder, frontend, mermaid]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: builder
    title: lib/rails-realtime-erd/builder.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/builder.rb
  - id: appjs
    title: app/javascript/rails_realtime_erd/application.js (DiagramController)
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/javascript/rails_realtime_erd/application.js
---

# Overview

The contract between the Ruby side ([Builder](/architecture/builder.md)) and the JS side ([viewer frontend](/architecture/viewer-frontend.md)). Keys are PascalCase at the top level and on models/relations (inherited from upstream), but **snake_case on columns** — don't "normalize" one side without updating `DiagramController`.[^builder] It travels inside `<script type="application/json" id="rre-schema-data">`.

# Schema

| Path | Type | Notes |
|---|---|---|
| `Models[].TableName` | string | |
| `Models[].TableComment` | string | `""` when the adapter has none. |
| `Models[].ModelName` | string | Namespaced names keep `::`; the viewer rewrites `:` → `-` for Mermaid. |
| `Models[].IsModelExist` | bool | Always `true` (upstream legacy). |
| `Models[].Columns[].name` | string | |
| `Models[].Columns[].type` | string | Abstract Rails type (`string`, `datetime`, …). |
| `Models[].Columns[].sql_type` | string | Raw adapter type, e.g. `character varying(255)`. |
| `Models[].Columns[].key` | `"PK"` \| `"FK"` \| `""` | FK only for real DB constraints. |
| `Models[].Columns[].comment` | string \| null | |
| `Relations[].LeftModelName` / `RightModelName` | string | |
| `Relations[].LeftValue` / `RightValue` | Mermaid cardinality glyph | See [relation merging](/architecture/relation-merging.md). |
| `Relations[].Line` | `"--"` \| `".."` | Dotted for through/HABTM. |
| `Relations[].Comment` | string | Accumulated association labels. |

# Type rendering

With "Show Column Type & Size" on, the viewer renders `sql_type` through `sanitizeType`, falling back to `type`.[^appjs] Mermaid attribute types must match `[*A-Za-z_][A-Za-z0-9\-_\[\]()]*`, so verbose Postgres names are first mapped to short aliases (`character varying` → `varchar`, `double precision` → `float8`, `timestamp with time zone` → `timestamptz`, `… without time zone` dropped), then any remaining illegal characters become `_` (`decimal(10,2)` → `decimal(10_2)`). A type with a space that reaches Mermaid breaks the whole diagram, not just one column.
