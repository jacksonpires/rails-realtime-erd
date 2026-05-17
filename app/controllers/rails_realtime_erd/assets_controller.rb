module RailsRealtimeErd
  class AssetsController < ApplicationController
    ASSETS = {
      "stimulus.js" => "app/javascript/rails_realtime_erd/vendor/stimulus.js",
      "mermaid.js" => "app/javascript/rails_realtime_erd/vendor/mermaid.js",
      "application.js" => "app/javascript/rails_realtime_erd/application.js"
    }.freeze

    skip_forgery_protection if respond_to?(:skip_forgery_protection)

    def show
      relative_path = ASSETS[params[:name]]
      return head :not_found unless relative_path

      path = Engine.root.join(relative_path)
      return head :not_found unless File.exist?(path)

      response.headers["Cache-Control"] = "private, max-age=300"
      response.headers["X-Content-Type-Options"] = "nosniff"
      send_file path, type: "text/javascript; charset=utf-8", disposition: "inline"
    end
  end
end
