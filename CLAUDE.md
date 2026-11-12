# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this gem does

`rails-realtime-erd` mounts `GET /rails/erd` in a host Rails app and renders a Mermaid ERD on every request by introspecting `ActiveRecord::Base.descendants`. There is no pre-generated artifact — the ERD reflects whatever the live schema + models look like at request time. Frontend is Stimulus (Hotwire). The original inspiration is [`rails-mermaid_erd`](https://github.com/koedame/rails-mermaid_erd), which generates a static HTML file via a rake task using Vue.

## Architecture

The gem is a `Rails::Engine` with `isolate_namespace`. Three pieces of code do the real work:

- **`lib/rails-realtime-erd/builder.rb`** — the introspection engine. Walks `ActiveRecord::Base.descendants`, builds a `Models` array (table name, table comment, columns with abstract `type` + raw `sql_type` and PK/FK tagging from `connection.foreign_keys`) and a `Relations` array (with cardinality glyphs and merged comments). **This file is ported almost verbatim from the original `rails-mermaid_erd` Builder** plus a filter that skips Rails internal classes (`ActiveRecord::SchemaMigration`, `ActiveRecord::InternalMetadata`, `ActiveStorage::*`, `ActionText::*`, `ActionMailbox::*`, and any `abstract_class`).
- **`lib/rails-realtime-erd/engine.rb`** — installs an initializer that auto-mounts the engine at `RailsRealtimeErd.configuration.mount_path` (default `/rails/erd`) when `Rails.env` is in `enabled_environments` (default `development`, `test`) and `auto_mount` is true.
- **`app/controllers/rails_realtime_erd/erd_controller.rb`** — calls `Rails.application.eager_load!`, clears the schema cache in dev (so `schema.rb` updates show up on the next refresh), runs the Builder, hands the JSON to the view as `@schema`.

### Relation merging — the subtle part

The Builder does **not** emit one relation per association. As it walks each side of a pair (e.g. `User has_many :posts` and `Post belongs_to :user`), it looks for a previously-emitted reverse relation and **mutates it**:

- The `LeftValue`/`RightValue` cardinality glyphs (`||`, `}o`, `o{`, `|o`, `o|`) encode optional vs. required ends, and get *upgraded* when the reverse side reveals optionality (e.g. `belongs_to optional: true` flips `||` → `o|` / `|o`).
- The `Comment` field accumulates an annotation per association name (`HM:posts`, `BT:user`, `HMT:tags`, `HABTM`, etc.) so a single Mermaid relation line carries every Rails-side name that points at it.
- `through:` associations live on a separate edge (`Line: ".."`) so they don't merge with the underlying direct association.

The contract is encoded directly in `spec/rails-realtime-erd/builder/model_data_spec.rb`. When changing this logic, that spec is the regression net.

`get_reflection_model_name` is the single place that resolves an association to its target model name, handling `class_name:`, `through: + source:`, and the bare case. Touch carefully — it affects every relation.

### Frontend

Standalone layout at `app/views/layouts/rails_realtime_erd/application.html.erb`. The layout does NOT extend the host app's layout (to avoid Turbo / Stimulus / CSS conflicts) and inlines its own assets:

- **TailwindCSS** + **Mermaid.js** + **Stimulus** are loaded from CDN
- **Engine CSS** (`app/assets/stylesheets/rails_realtime_erd/erd.css`) and **all Stimulus controllers** (`app/javascript/rails_realtime_erd/application.js`) are inlined via `File.read` in the helper `inline_asset`. This means the gem works regardless of the host's asset pipeline choice (Sprockets / Propshaft / importmap / none).

Seven Stimulus controllers split the work:

| Controller | Responsibility |
|---|---|
| `filter` | Selected models, options (preview-relations / show-key / show-comment / show-type / hide-columns / show-relation-comment), filter text, select all / none. Broadcasts `filter:changed` events. |
| `diagram` | Listens to `filter:changed`, computes the `erDiagram` Mermaid code, calls `mermaid.render`, injects the SVG into `#rre-preview`. Owns the schema data loaded from `<script id="rre-schema-data">`. |
| `hash-state` | Restores state from `location.hash` (base64 JSON) on connect; writes back on every `filter:changed`. Uses the `filter` outlet. |
| `clipboard` | Copy URL / Mermaid code / Markdown code with 1s "Copied" feedback. Reads the current Mermaid code via the `diagram` outlet. |
| `download` | Download SVG / PNG of the rendered diagram. Reads the SVG via the `diagram` outlet. |
| `tab` | Toggle between the ERD pane and the raw-Mermaid Code pane. |
| `zoom-pan` | Space + drag, middle-click + drag, mouse wheel, pinch-in/out, on-screen `+ -` and arrow buttons. Applies `transform: scale() translate()` to the zoom area. |

Cross-controller communication is via CustomEvent (`filter:changed`) and Stimulus outlets, not a shared store.

## Common commands

```bash
# install deps
bundle install

# run full suite
bundle exec rspec

# single spec file or example
bundle exec rspec spec/rails-realtime-erd/builder/model_data_spec.rb
bundle exec rspec spec/rails-realtime-erd/builder/model_data_spec.rb:12

# lint
bundle exec standardrb
bundle exec standardrb --fix
```

The dummy app at `spec/dummy` uses SQLite. SQLite does NOT preserve column-level or table-level comments — the Builder spec asserts `nil` / `""` for those fields accordingly. The Builder code forwards whatever `column.comment` / `connection.table_comment` returns, so on Postgres/MySQL those values would round-trip correctly. Don't add Postgres-specific behavior to the Builder thinking the spec is wrong.

### Multi-Rails test matrix

The root `Gemfile` targets the latest Rails (8.1, needs Ruby ≥ 3.2). Older supported versions have their own Gemfile in `gemfiles/` (`rails_6_1`, `rails_7_0`, `rails_7_1`, `rails_7_2`, `rails_8_0`); select one with `BUNDLE_GEMFILE=gemfiles/rails_6_1.gemfile bundle exec rspec`. Dev dependencies (sqlite3, rspec-rails, standard) live in these Gemfiles, **not** in the gemspec — pinning them in the gemspec forces the same version on every Gemfile that calls `gemspec` and breaks the matrix (Rails 8 needs sqlite3 ≥ 2.1, Rails 6.1 needs sqlite3 1.x). Rails 6.1 does not load on Ruby ≥ 3.4 (`bigdecimal` is no longer a default gem); test it on Ruby ≤ 3.3. CI matrix is in `.github/workflows/ci.yml` (oldest + newest supported Ruby per Rails minor) and is mirrored in the README "Compatibility" table — keep the two in sync.

Use a non-system Ruby (rbenv/asdf). The macOS system Ruby 2.6 is a universal binary that makes Bundler install x86_64 builds of native gems (`incompatible architecture`).

## Conventions

- Code style is **StandardRb**.
- Gem must keep working on Rails `>= 6.1` per the gemspec, so avoid newer-Rails-only APIs — and run the 6.1 gemfile before calling a change done.
- UI is **English only** (no i18n) — strings are static in the ERB views.
- The viewer must remain entirely client-side after initial page load. Don't add Turbo Frame roundtrips per checkbox — Stimulus state changes only.
- The engine layout must remain standalone (don't `layout "application"` against the host) — host conflicts are easy to introduce and silent.
- The viewer is a full-viewport app shell: `#rre-app` is an `h-screen` flex column, header/footer are `flex-none`, the middle row is `flex-1 min-h-0`, the sidebar scrolls on its own (`overflow-y-auto`) and the ERD/Code panes are `flex-1 min-h-0`. The page itself must never scroll, however many models the host has. Don't reintroduce `calc(100vh - …px)` heights — they hard-code header/footer sizes and let a long model list push the page past the window. The diagram SVG is fitted inside the pane on render (`max-width`/`max-height: 100%`, never upscaled), with bottom padding on `#rre-preview` so it clears the overlaid Movement/Zoom hint bar.
