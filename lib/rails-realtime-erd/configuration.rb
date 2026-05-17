module RailsRealtimeErd
  class Configuration
    attr_accessor :mount_path, :auto_mount, :enabled_environments

    def initialize
      @mount_path = "/rails/erd"
      @auto_mount = true
      @enabled_environments = %w[development test]
    end
  end
end
