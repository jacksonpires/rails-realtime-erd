require_relative "boot"

require "logger"
require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)
require "rails-realtime-erd"

module Dummy
  class Application < Rails::Application
    config.load_defaults Rails::VERSION::STRING.to_f
    config.eager_load = false
    config.active_record.belongs_to_required_by_default = true
    config.api_only = false
    config.hosts.clear if config.respond_to?(:hosts)
  end
end
