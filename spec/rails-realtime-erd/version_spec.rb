require "spec_helper"

RSpec.describe RailsRealtimeErd do
  it "exposes a version string" do
    expect(RailsRealtimeErd::VERSION).to match(/\A\d+\.\d+\.\d+\z/)
  end
end
