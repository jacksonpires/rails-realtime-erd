require "spec_helper"

# NOTE: column-level and table-level comments are not preserved by Rails'
# SQLite adapter (SQLite has no native comment syntax), so the spec asserts
# `comment: nil` / `TableComment: ""` even though the schema declares them.
# The Builder logic forwards whatever `connection.table_comment` and
# `column.comment` return verbatim, so on Postgres/MySQL those values would
# round-trip correctly.
#
# Likewise, `sql_type` is the raw DB type string exactly as the adapter
# reports it. Because none of the dummy columns declare a `limit`/`precision`,
# SQLite reports bare types with no size — and integer columns come back
# upper-cased (`INTEGER`) while the rest are lower-cased (`varchar`,
# `datetime`, `date`). On Postgres/MySQL a
# `t.string limit: 255` / `t.decimal precision: 10, scale: 2` would come back
# as `varchar(255)` / `decimal(10,2)` — the Builder forwards it verbatim.
RSpec.describe RailsRealtimeErd::Builder do
  let(:result) { described_class.model_data }

  it "Model includes" do
    expect(result[:Models]).to match_array([{
      TableName: "user_images",
      TableComment: "",
      ModelName: "UserImage",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "image", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "user_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "tags",
      TableComment: "",
      ModelName: "Tag",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "name", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "posts_tags",
      TableComment: "",
      ModelName: "PostsTag",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "post_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "tag_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "posts",
      TableComment: "",
      ModelName: "Post",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "title", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "user_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "comments",
      TableComment: "",
      ModelName: "Comment",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "body", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "post_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "user_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "user_profiles",
      TableComment: "",
      ModelName: "AuthorProfile",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "birthday", type: :date, sql_type: "date", key: "", comment: nil},
        {name: "user_id", type: :integer, sql_type: "INTEGER", key: "FK", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }, {
      TableName: "users",
      TableComment: "",
      ModelName: "Author",
      IsModelExist: true,
      Columns: [
        {name: "id", type: :integer, sql_type: "INTEGER", key: "PK", comment: nil},
        {name: "name", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "email", type: :string, sql_type: "varchar", key: "", comment: nil},
        {name: "created_at", type: :datetime, sql_type: "datetime", key: "", comment: nil},
        {name: "updated_at", type: :datetime, sql_type: "datetime", key: "", comment: nil}
      ]
    }])
  end

  it "Relation includes" do
    expect(result[:Relations]).to match_array([{
      LeftModelName: "Author",
      LeftValue: "||",
      Line: "--",
      RightModelName: "Post",
      RightValue: "o{",
      Comment: "HM:posts, BT:author"
    }, {
      LeftModelName: "Author",
      LeftValue: "||",
      Line: "--",
      RightModelName: "Comment",
      RightValue: "o{",
      Comment: "HM:comments, BT:author"
    }, {
      LeftModelName: "Author",
      LeftValue: "}o",
      Line: "..",
      RightModelName: "Post",
      RightValue: "o{",
      Comment: "HMT:comment_posts, HMT:comment_authors"
    }, {
      LeftModelName: "Author",
      LeftValue: "|o",
      Line: "--",
      RightModelName: "UserImage",
      RightValue: "o{",
      Comment: "HM:images, BT:user"
    }, {
      LeftModelName: "Author",
      LeftValue: "||",
      Line: "--",
      RightModelName: "AuthorProfile",
      RightValue: "o|",
      Comment: "HO:profile, BT:author"
    }, {
      LeftModelName: "Comment",
      LeftValue: "}o",
      Line: "--",
      RightModelName: "Post",
      RightValue: "||",
      Comment: "BT:post, HM:comments"
    }, {
      LeftModelName: "Post",
      LeftValue: "}o",
      Line: "..",
      RightModelName: "Tag",
      RightValue: "o{",
      Comment: "HABTM"
    }, {
      LeftModelName: "PostsTag",
      LeftValue: "}o",
      Line: "--",
      RightModelName: "Post",
      RightValue: "||",
      Comment: "BT:post"
    }, {
      LeftModelName: "PostsTag",
      LeftValue: "}o",
      Line: "--",
      RightModelName: "Tag",
      RightValue: "||",
      Comment: "BT:tag"
    }])
  end
end
