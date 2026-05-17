require_relative "rails-realtime-erd/version"
require_relative "rails-realtime-erd/configuration"
require_relative "rails-realtime-erd/builder"
require_relative "rails-realtime-erd/engine"

module RailsRealtimeErd
  class << self
    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield configuration
    end

    def reset_configuration!
      @configuration = Configuration.new
    end
  end
end
