class Project < ActiveRecord::Base
  belongs_to :user
  has_many :commits

  attr_accessor :project_json
  attr_accessor :compiled_code

  validates :project_json, :compiled_code, :user, :title, :uuid, presence: true
  validates :uuid, uniqueness: true
  validate :compiled_code_is_valid
  validate :project_json_is_valid_and_fields_match

  after_save :create_commit
  before_update :update_or_create_commit

  def create_commit
    commit = Commit.new
    commit.project_json = self.project_json
    commit.compiled_code = self.compiled_code
    commit.project = self

    if !commit.save
      throw "Commit didn't save for some reason"
    end
  end

  def latest_commit
    self.commits.order("updated_at DESC").first
  end

  def update_or_create_commit
    commit = self.latest_commit

    if commit.is_childless?
      if commit.needs_update?
        new_commit = Commit.new
        new_commit.project_json = self.project_json
        new_commit.compiled_code = self.compiled_code
        new_commit.project = self
        new_commit.parent = commit

        if !commit.save
          self.errors(:commit, "could not be created")
          false
        end
      end
    else
      self.errors(:commit, "had a child")
      false
    end
  end

  def compiled_code_is_valid
    begin
      JSON.parse self.compiled_code
    rescue JSON::ParserError
      errors.add(:compiled_code, "is not valid JSON")
    end
  end

  def project_json_is_valid_and_fields_match
    begin
      project_json = JSON.parse self.project_json

      if project_json.has_key?("uuid")
        if project_json["uuid"] != self.uuid
          errors.add(:project_json, "uuid doesn't match provided uuid")
        end
      else
        errors.add(:project_json, "must have uuid key")
      end

      if project_json.has_key?("title")
        if project_json["title"] != self.title
          errors.add(:project_json, "title doesn't match provided title")
        end
      else
        errors.add(:project_json, "must have title key")
      end

      if project_json.has_key?("description")
        if project_json["description"] != self.description
          errors.add(:project_json, "description doesn't match provided description")
        end
      else
        errors.add(:project_json, "must have description key")
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
