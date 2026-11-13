class Note < ApplicationRecord
  has_and_belongs_to_many :stargazers, class_name: "Blogger", join_table: "bloggers_notes"
  belongs_to :entry
  belongs_to :blogger
end
