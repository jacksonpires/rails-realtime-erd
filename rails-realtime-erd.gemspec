require_relative "lib/rails-realtime-erd/version"

Gem::Specification.new do |spec|
  spec.name = "rails-realtime-erd"
  spec.version = RailsRealtimeErd::VERSION
  spec.authors = ["Jackson Pires"]
  spec.email = ["jackson@linkana.com"]
  spec.homepage = "https://github.com/jacksonpires/rails-realtime-erd"
  spec.summary = "Live Mermaid ERD viewer mounted as a Rails route, powered by Hotwire."
  spec.description = "Mounts /rails/erd in your Rails app. On every request the gem introspects ActiveRecord models and renders a Mermaid ERD viewer with Stimulus-driven filters, zoom/pan, copy & download. No pre-generated HTML file."
  spec.license = "MIT"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end
  spec.require_paths = ["lib"]

  spec.add_dependency "rails", ">= 6.1.7.10"

  spec.add_development_dependency "sqlite3", "1.5.0"
  spec.add_development_dependency "rspec-rails", "6.1.5"
  spec.add_development_dependency "rake", "13.4.2"
  spec.add_development_dependency "standard", "1.28.5"
end
