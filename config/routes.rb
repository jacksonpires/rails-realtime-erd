RailsRealtimeErd::Engine.routes.draw do
  root to: "erd#show", as: :erd
  get "assets/:name", to: "assets#show", as: :engine_asset, constraints: {name: /[\w.\-]+/}
end
