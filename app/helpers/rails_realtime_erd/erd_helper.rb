module RailsRealtimeErd
  module ErdHelper
    def inline_asset(relative_path)
      path = Engine.root.join(relative_path)
      File.read(path)
    end

    def inline_stylesheet(relative_path)
      content_tag(:style, inline_asset(relative_path).html_safe)
    end

    def inline_javascript(relative_path, type: "module")
      content_tag(:script, inline_asset(relative_path).html_safe, type: type)
    end

    def schema_data_tag(schema)
      content_tag(
        :script,
        schema.to_json.html_safe,
        type: "application/json",
        id: "rre-schema-data"
      )
    end
  end
end
