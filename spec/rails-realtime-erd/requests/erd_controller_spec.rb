require "spec_helper"

RSpec.describe "GET /rails/erd", type: :request do
  it "responds with HTML containing the ERD viewer" do
    get "/rails/erd"
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Rails Realtime ERD")
    expect(response.body).to include("data-controller=\"hash-state filter diagram clipboard download tab zoom-pan\"")
    expect(response.body).to include("id=\"rre-schema-data\"")
    expect(response.body).to include("Author")
    expect(response.body).to include("UserImage")
  end

  it "embeds the schema JSON in the page" do
    get "/rails/erd"
    body = response.body
    json_match = body.match(/<script type="application\/json" id="rre-schema-data">(.+?)<\/script>/m)
    expect(json_match).not_to be_nil
    schema = JSON.parse(json_match[1])
    model_names = schema["Models"].map { |m| m["ModelName"] }
    expect(model_names).to include("Author", "AuthorProfile", "Post", "Comment", "Tag", "PostsTag", "UserImage")
  end

  it "loads vendored JS from same-origin engine routes (CSP-friendly)" do
    get "/rails/erd"
    expect(response.body).to include('src="/rails/erd/assets/stimulus.js"')
    expect(response.body).to include('src="/rails/erd/assets/mermaid.js"')
    expect(response.body).to include('src="/rails/erd/assets/application.js"')
  end
end

RSpec.describe "GET /rails/erd/assets/:name", type: :request do
  it "serves stimulus.js as javascript" do
    get "/rails/erd/assets/stimulus.js"
    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/javascript")
    expect(response.body).to include("Stimulus")
  end

  it "serves mermaid.js as javascript" do
    get "/rails/erd/assets/mermaid.js"
    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/javascript")
    expect(response.body).to include("mermaid")
  end

  it "serves application.js as javascript" do
    get "/rails/erd/assets/application.js"
    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/javascript")
    expect(response.body).to include("rails-realtime-erd")
  end

  it "returns 404 for unknown asset names" do
    get "/rails/erd/assets/evil.js"
    expect(response).to have_http_status(:not_found)
  end
end
