# Update Log

## 2026-11-13
* **Update**: The Builder's `belongs_to` and HABTM reverse lookups now match the edge's line style, so they no longer merge into the wrong edge when a pair has both a direct and a dotted edge. The remaining HABTM-vs-through ambiguity is documented. — [relation merging](/architecture/relation-merging.md), [Builder](/architecture/builder.md).
* **Update**: CLAUDE.md now describes vendored same-origin asset delivery instead of CDN loading. — [vendored same-origin assets](/decisions/vendored-same-origin-assets.md).
* **Creation**: Initial bundle produced from the gem's source at v0.2.0 (commit `b5c22f8`) — [index](/index.md).
* **Creation**: Architecture concepts — [engine mounting](/architecture/engine-mounting.md), [request lifecycle](/architecture/request-lifecycle.md), [Builder](/architecture/builder.md), [relation merging](/architecture/relation-merging.md), [schema JSON contract](/architecture/schema-json-contract.md), [viewer frontend](/architecture/viewer-frontend.md), [asset delivery](/architecture/asset-delivery.md).
* **Creation**: Decisions — [standalone layout](/decisions/standalone-layout.md), [vendored same-origin assets](/decisions/vendored-same-origin-assets.md), [client-side viewer](/decisions/client-side-viewer.md), [full-viewport shell](/decisions/full-viewport-shell.md), [dev deps in Gemfiles](/decisions/dev-deps-in-gemfiles.md), [Rails 6.1 floor](/decisions/rails-6-1-floor.md).
* **Creation**: Operations — [multi-Rails test matrix](/operations/multi-rails-test-matrix.md), [SQLite comment limitation](/operations/sqlite-comment-limitation.md).
