class Commit < ActiveRecord::Base
  belongs_to :project
  has_ancestry

  validates :project_json, :compiled_components, :project, presence: true

  def needs_update? project_json, compiled_components
    Digest::SHA1.hexdigest(project_json) != Digest::SHA1.hexdigest(self.project_json) || 
      Digest::SHA1.hexdigest(compiled_components) != Digest::SHA1.hexdigest(self.compiled_components)
  end
end
