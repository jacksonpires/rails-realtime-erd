# Exercises relation-merge ordering in the Builder: the through association is
# declared *before* the direct one, so its dotted (`..`) edge to Entry is
# emitted first, and the HABTM to Note is declared on a pair that already has
# a direct (`--`) edge. Entry#blogger and Note#stargazers must merge into the
# matching edge type, not into whichever edge happens to come first.
class Blogger < ApplicationRecord
  has_many :noted_entries, through: :notes, source: :entry
  has_many :entries
  has_many :notes
  has_and_belongs_to_many :starred_notes, class_name: "Note", join_table: "bloggers_notes"
end
