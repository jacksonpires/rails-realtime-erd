# Decisions

* [Standalone layout](standalone-layout.md) - The engine never renders inside the host app's layout.
* [Vendored same-origin assets](vendored-same-origin-assets.md) - JS is vendored and served by the engine instead of a CDN, for strict-CSP hosts.
* [Client-side viewer](client-side-viewer.md) - After the first page load, every interaction is local Stimulus state; no server round-trips.
* [Full-viewport shell](full-viewport-shell.md) - The page never scrolls; panes flex inside an `h-screen` column.
* [Dev dependencies in Gemfiles](dev-deps-in-gemfiles.md) - sqlite3/rspec-rails/standard live in per-Rails Gemfiles, never in the gemspec.
* [Rails 6.1 floor](rails-6-1-floor.md) - The gem supports Rails >= 6.1, which constrains which APIs code may use.
