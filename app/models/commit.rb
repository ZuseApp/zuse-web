class Commit < ActiveRecord::Base
  belongs_to :project
  has_ancestry

  validates :project_json, :compiled_code, :project, presence: true

  def needs_update? project_json, compiled_code
    Digest::SHA1.hexdigest(project_json) != Digest::SHA1.hexdigest(self.project_json) || 
      Digest::SHA1.hexdigest(compiled_code) != Digest::SHA1.hexdigest(self.compiled_code)
  end
end
