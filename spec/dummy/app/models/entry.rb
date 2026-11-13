class Entry < ApplicationRecord
  belongs_to :blogger, optional: true
end
