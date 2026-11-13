---
okf_version: "0.2"
---

# rails-realtime-erd

Knowledge bundle for the `rails-realtime-erd` gem: a Rails engine that mounts `GET /rails/erd` and renders a live Mermaid ERD of the host app's ActiveRecord models on every request.

* [Architecture](architecture/) - How the engine is wired: mounting, request lifecycle, the Builder, the schema JSON contract and the Stimulus viewer.
* [Decisions](decisions/) - Why the gem is shaped the way it is, and the constraints that must not regress.
* [Operations](operations/) - Running the test matrix and the local toolchain gotchas.
* [Update log](log.md) - What changed in this bundle, newest first.
