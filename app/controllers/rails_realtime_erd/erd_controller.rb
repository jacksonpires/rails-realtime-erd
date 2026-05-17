module RailsRealtimeErd
  class ErdController < ApplicationController
    layout "rails_realtime_erd/application"

    def show
      ::Rails.application.eager_load!

      if ::Rails.env.development?
        connection = ::ActiveRecord::Base.connection
        connection.schema_cache.clear! if connection.respond_to?(:schema_cache)
      end

      @schema = Builder.model_data
      @app_name = ::Rails.application.class.try(:module_parent_name) || ::Rails.application.class.try(:parent_name) || "Application"
      @version = RailsRealtimeErd::VERSION
    end
  end
end
