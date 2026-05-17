# -*- encoding: utf-8 -*-
# stub: thor 1.5.0 ruby lib

Gem::Specification.new do |s|
  s.name = "thor".freeze
  s.version = "1.5.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 1.3.5".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/rails/thor/issues", "changelog_uri" => "https://github.com/rails/thor/releases/tag/v1.5.0", "documentation_uri" => "https://github.com/rails/thor/wiki", "rubygems_mfa_required" => "true", "source_code_uri" => "https://github.com/rails/thor/tree/v1.5.0", "wiki_uri" => "https://github.com/rails/thor/wiki" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Yehuda Katz".freeze, "Jos\u00E9 Valim".freeze]
  s.date = "1980-01-02"
  s.description = "Thor is a toolkit for building powerful command-line interfaces.".freeze
  s.email = "ruby-thor@googlegroups.com".freeze
  s.executables = ["thor".freeze]
  s.files = ["bin/thor".freeze]
  s.homepage = "https://github.com/rails/thor".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.0.3.1".freeze
  s.summary = "Thor is a toolkit for building powerful command-line interfaces.".freeze

  s.installed_by_version = "3.0.3.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>.freeze, [">= 1.0"])
    else
      s.add_dependency(%q<bundler>.freeze, [">= 1.0"])
    end
  else
    s.add_dependency(%q<bundler>.freeze, [">= 1.0"])
  end
end
