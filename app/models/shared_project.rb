class SharedProject < ActiveRecord::Base
 
  validates :project_json, :compiled_components, presence: true
  validate :project_json_is_valid
  validate :compiled_components_is_valid

  def project_json_is_valid
    if !self.project_json.blank?
      begin
        JSON.parse self.project_json
      rescue JSON::ParserError
        errors.add(:project_json, "is not valid JSON")
      end
    end
  end

  def compiled_components_is_valid
    if !self.compiled_components.blank?
      begin
        JSON.parse self.compiled_components
      rescue JSON::ParserError
        errors.add(:compiled_components, "is not valid JSON")
      end
    end
  end
end
