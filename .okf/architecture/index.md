# Architecture

* [Engine mounting](engine-mounting.md) - How the engine auto-mounts itself at `/rails/erd` and which configuration gates it.
* [Request lifecycle](request-lifecycle.md) - What happens on each `GET /rails/erd`: eager load, schema-cache clear, Builder, render.
* [Builder](builder.md) - The introspection engine that turns ActiveRecord models into the Models/Relations JSON.
* [Relation merging](relation-merging.md) - How the Builder folds both sides of an association into one Mermaid relation, and its order-dependent edge cases.
* [Schema JSON contract](schema-json-contract.md) - The shape of the JSON the Builder emits and the viewer consumes.
* [Viewer frontend](viewer-frontend.md) - The seven Stimulus controllers and how they talk to each other.
* [Asset delivery](asset-delivery.md) - How CSS and JS reach the browser without touching the host's asset pipeline.
