require "spec_helper"

RSpec.describe RailsRealtimeErd::Configuration do
  after { RailsRealtimeErd.reset_configuration! }

  it "has sane defaults" do
    config = described_class.new
    expect(config.mount_path).to eq("/rails/erd")
    expect(config.auto_mount).to eq(true)
    expect(config.enabled_environments).to eq(%w[development test])
  end

  it "can be configured via RailsRealtimeErd.configure" do
    RailsRealtimeErd.configure do |c|
      c.mount_path = "/custom/erd"
      c.auto_mount = false
      c.enabled_environments = %w[staging]
    end
    expect(RailsRealtimeErd.configuration.mount_path).to eq("/custom/erd")
    expect(RailsRealtimeErd.configuration.auto_mount).to eq(false)
    expect(RailsRealtimeErd.configuration.enabled_environments).to eq(%w[staging])
  end
end
