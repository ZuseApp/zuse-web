class Project < ActiveRecord::Base
  belongs_to :user
  has_many :commits

  attr_accessor :project_json
  attr_accessor :compiled_code

  validates :project_json, :compiled_code, :user, presence: true
  validates :uuid, uniqueness: true
  validate :compiled_code_is_valid
  validate :project_json_is_valid_and_contains_required_fields

  def compiled_code_is_valid_json
    begin
      JSON.parse self.compiled_code
    rescue JSON::ParserError
      errors.add(:compiled_code, "is not valid JSON")
    end
  end

  def project_json_is_valid_and_contains_required_fields
    begin
      project_json = JSON.parse self.project_json

      if !project_json.has_key?("title")
        errors.add(:project_json, "must contain a title")
      end

      if !projet_json.has_key?("uuid")
        errors.add(:project_json, "must contain a uuid")
      end
    rescue JSON::ParserError
      errors.add(:project_json, "is not valid JSON")
    end
  end

  def meta
    {
      uuid: self.uuid,
      title: self.title,
      description: self.description,
      downloads: self.downloads,
      username: self.user.username
    }
  end

  def full
    commit = self.commits.order("created_at DESC").last
    {
      uuid: self.uuid,
      title: self.title,
      description: self.description,
      downloads: self.downloads,
      username: self.user.username,
      project_json: commit.project_json,
      compiled_code: commit.compiled_code
    }
  end
end
