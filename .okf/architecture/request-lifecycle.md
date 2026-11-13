---
type: Component
title: Request lifecycle
description: What GET /rails/erd does on every request, and why the ERD is always current without a restart.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/controllers/rails_realtime_erd/erd_controller.rb
tags: [builder, realtime]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T12:00:00Z
sources:
  - id: erd-controller
    title: app/controllers/rails_realtime_erd/erd_controller.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/controllers/rails_realtime_erd/erd_controller.rb
  - id: helper
    title: app/helpers/rails_realtime_erd/erd_helper.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/app/helpers/rails_realtime_erd/erd_helper.rb
---

# Overview

"Realtime" means *per request*: nothing is pre-generated. `ErdController#show` does, in order:[^erd-controller]

1. `Rails.application.eager_load!` — so every model class is defined before `ActiveRecord::Base.descendants` is walked. (The [Builder](/architecture/builder.md) calls it again; the duplicate is harmless and keeps the Builder usable outside the controller.)
2. **Development only:** `connection.schema_cache.clear!` — without it a migration run in another terminal would not show up until the server restarts.
3. `Builder.model_data` → `@schema`.
4. Resolves `@app_name` from `module_parent_name`, falling back to `parent_name` (Rails < 6 spelling) and finally `"Application"`.

The view embeds `@schema` as `<script type="application/json" id="rre-schema-data">` via `schema_data_tag`;[^helper] from that point on the page is purely client-side (see [client-side viewer](/decisions/client-side-viewer.md) and the [schema JSON contract](/architecture/schema-json-contract.md)).

Cost scales with the number of models: every request eager-loads the app and queries `foreign_keys` and `table_comment` once per table. Acceptable for a dev tool; not something to expose on a hot path.
