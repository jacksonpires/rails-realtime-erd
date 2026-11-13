---
type: Concept
title: Relation merging
description: How the Builder folds both sides of an association pair into one Mermaid relation line, and why the result depends on model and association order.
resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/builder.rb
tags: [builder, mermaid, gotcha, upstream-port]
generated:
  by: claude-code/claude-opus-5-5
  at: 2026-11-13T15:00:00Z
sources:
  - id: builder
    title: lib/rails-realtime-erd/builder.rb
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/lib/rails-realtime-erd/builder.rb
  - id: builder-spec
    title: spec/rails-realtime-erd/builder/model_data_spec.rb ("Relation includes")
    resource: https://github.com/jacksonpires/rails-realtime-erd/blob/main/spec/rails-realtime-erd/builder/model_data_spec.rb
---

# Overview

The [Builder](/architecture/builder.md) does **not** emit one relation per association. While walking each model it looks for a previously emitted *reverse* relation (Right = current model, Left = target) and, if found, **mutates it** instead of adding a new one.[^builder] So `Author has_many :posts` + `Post belongs_to :author` becomes a single line `Author ||--o{ Post : "HM:posts, BT:author"`.[^builder-spec]

# Order is part of the algorithm

- Models are walked **alphabetically** (`sort_by(&:name)`), and within a model associations in the fixed order `has_many → has_and_belongs_to_many → belongs_to → has_one`.
- Whichever side is visited first becomes the **Left** model and fixes the edge's base glyphs; the later side only appends to `Comment` and possibly upgrades a glyph. Example: `Comment` sorts before `Post`, so the pair is emitted as `Comment }o--|| Post : "BT:post, HM:comments"`, not from Post's side.
- Renaming a model can therefore flip which side an edge is drawn from. Spec diffs after a rename are expected, not necessarily a regression.

# Glyphs and how they get upgraded

| Association (first side) | Left | Line | Right |
|---|---|---|---|
| `has_many` | `\|\|` | `--` | `o{` |
| `has_many through:` | `}o` | `..` | `o{` |
| `has_and_belongs_to_many` | `}o` | `..` | `o{` |
| `belongs_to` (required) | `}o` | `--` | `\|\|` |
| `belongs_to` (optional) | `}o` | `--` | `o\|` |
| `has_one` | `\|\|` | `--` | `o\|` |
| `has_one through:` | `}o` | `..` | `o\|` |

When the reverse side is merged in: an optional `belongs_to` sets the existing edge's Left to `|o`; a `has_one` sets Left to `|o` unconditionally; `has_many` changes no glyph. Optionality honors `belongs_to_required_by_default` (`optional: true` when it is on, absence of `required: true` when it is off).

# Comment labels

`HM`, `HMT`, `BT`, `HO`, `HOT` are appended as `, <LABEL>:<association name>`. `HABTM` is special: a merge **overwrites** the comment with the bare string `HABTM` (no names).

# Reverse lookups match the line style

Every reverse lookup filters on `Line` as well as the model pair, so a pair can carry a direct edge and a dotted edge side by side without them absorbing each other:

| Association being merged | Only merges into |
|---|---|
| `has_many` / `has_one` | `--` edges |
| `has_many through:` / `has_one through:` | `..` edges |
| `belongs_to` | `--` edges |
| `has_and_belongs_to_many` | `..` edges |

So `Author has_many :comment_posts, through: :comments` lives on its own dotted edge (`HMT:comment_posts, HMT:comment_authors`) instead of merging into `HM:posts`.

The `belongs_to` and HABTM filters were added on 2026-11-13; before that both took the *first* edge for the pair, whatever its style. Two real failures followed: a `through:` declared before the direct association made `belongs_to` fold its `BT:` label (and its optional `|o` glyph) into the dotted edge; and a HABTM whose pair already had a direct edge overwrote that edge's comment with `HABTM`, erasing its `HM:`/`BT:` labels. This is a deliberate divergence from the upstream Builder. The dummy app's `Blogger`/`Entry`/`Note` models exist only to pin both cases (the "reverse lookup respects the edge's line style" examples in `model_data_spec.rb`).

**Remaining ambiguity:** HABTM and through associations both draw `..`, so the line style cannot tell them apart. If the same pair has both an HMT and a HABTM, a HABTM merge can still overwrite the HMT edge's comment, and an HMT can append to the HABTM edge. Telling them apart would need a marker on the edge, not just `Line`. No known app hits this yet.
