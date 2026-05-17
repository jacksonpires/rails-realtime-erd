require "rails/engine"

module RailsRealtimeErd
  class Engine < ::Rails::Engine
    isolate_namespace RailsRealtimeErd

    initializer "rails_realtime_erd.auto_mount" do |app|
      config = RailsRealtimeErd.configuration
      next unless config.auto_mount
      next unless config.enabled_environments.map(&:to_s).include?(Rails.env.to_s)

      mount_path = config.mount_path
      app.routes.append do
        mount RailsRealtimeErd::Engine => mount_path, as: :rails_realtime_erd
      end
    end
  end
end
