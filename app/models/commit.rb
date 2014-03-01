class Commit < ActiveRecord::Base
  belongs_to :project
  has_ancestry
end
