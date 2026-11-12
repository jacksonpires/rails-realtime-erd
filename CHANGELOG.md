# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-11-12

### Added

- "Show Column Type & Size" option: displays each column's raw database type
  (`varchar(255)`, `numeric(10,2)`, `timestamp(6)`, …) instead of the abstract
  Rails type. Verbose Postgres types are shortened to their standard aliases
  (`character varying` → `varchar`, `timestamp with time zone` → `timestamptz`,
  `double precision` → `float8`). ([#1], [#3])
- Declared `required_ruby_version >= 2.5.0`. ([#2])

### Changed

- The viewer now fills the browser window: the page never scrolls, the model
  sidebar scrolls on its own and the ERD/Code panes take the remaining height,
  with the zoom/pan controls always at the bottom of the window. Previously a
  long model list or a small window made the whole page scroll. ([#4])
- Diagrams are fitted inside the pane on render (never upscaled), so tall
  diagrams are no longer clipped at the top and bottom. SVG/PNG downloads still
  export the full-size diagram. ([#4])

### Fixed

- The footer link now points to the gem's repository instead of github.com.

### Compatibility

- Tested against Rails 6.1, 7.2 and 8.1 on Ruby 3.0 through 4.0 in CI. ([#2])

## [0.1.0] - 2026-05-17

- Initial release.

[0.2.0]: https://github.com/jacksonpires/rails-realtime-erd/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jacksonpires/rails-realtime-erd/releases/tag/v0.1.0
[#1]: https://github.com/jacksonpires/rails-realtime-erd/pull/1
[#2]: https://github.com/jacksonpires/rails-realtime-erd/pull/2
[#3]: https://github.com/jacksonpires/rails-realtime-erd/pull/3
[#4]: https://github.com/jacksonpires/rails-realtime-erd/pull/4
