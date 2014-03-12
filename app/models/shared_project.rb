class SharedProject < ActiveRecord::Base
 
  validates :project_json, :compiled_code, presence: true
  validate :project_json_is_valid
  validate :compiled_code_is_valid

  def project_json_is_valid
    if !self.project_json.blank?
      begin
        JSON.parse self.project_json
      rescue JSON::ParserError
        errors.add(:project_json, "is not valid JSON")
      end
    end
  end

  def compiled_code_is_valid
    if !self.compiled_code.blank?
      begin
        JSON.parse self.compiled_code
      rescue JSON::ParserError
        errors.add(:compiled_code, "is not valid JSON")
      end
    end
  end
end
