class Project < ActiveRecord::Base
  belongs_to :user
  has_many :commits

  attr_accessor :project_json
  attr_accessor :compiled_code

  validates :user, :title, :uuid, presence: true
  validates :uuid, uniqueness: true
  validate :compiled_code_is_valid
  validate :project_json_is_valid_and_fields_match

  after_create :create_commit
  before_update :update_or_create_commit

  def create_commit
    commit = Commit.new
    commit.project_json = self.project_json
    commit.compiled_code = self.compiled_code
    commit.project = self
    commit.save!
  end

  def latest_commit
    self.commits.order("updated_at DESC").first
  end

  def update_or_create_commit
    commit = self.latest_commit

    if commit.is_childless?
      if commit.needs_update? self.project_json, self.compiled_code
        new_commit = Commit.new
        new_commit.project_json = self.project_json
        new_commit.compiled_code = self.compiled_code
        new_commit.project = self
        new_commit.parent = commit

        if !new_commit.save
          self.errors(:project, "commit could not be created")
          false
        end
      end
    else
      self.errors(:project, "commit had a child")
      false
    end
  end

  def fork user, version
    begin
      if version.nil?
        return [ "Version can't be blank" ]
      end

      if user.nil?
        return [ "User can't be blank" ]
      end
      
      uuid = SecureRandom.uuid
      
      commit_parent = Commit.find_by_id version
      project_json = JSON.parse commit_parent.project_json
      project_json["id"] = uuid
      
      puts self.inspect
      puts self.commits.inspect

      new_project = self.dup

      puts new_project.commits.inspect
      puts new_project.inspect

      new_project.uuid = uuid
      new_project.project_json = project_json.to_json
      new_project.compiled_code = commit_parent.compiled_code
      new_project.user = user
     
      if new_project.save
        puts new_project.commits.inspect
        commit_child = new_project.latest_commit
        commit_child.parent = commit_parent

        if !commit_child.save
          new_project.destroy
          errors = commit_child.errors.full_messages
          commit_child.destroy
          return errors
        end
      end

      new_project
    rescue JSON::ParserError
      new_project.errors.add(:project_json, "is not valid JSON")
      new_project
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

  def project_json_is_valid_and_fields_match
    if !self.project_json.blank?
      begin
        project_json = JSON.parse self.project_json

        if project_json.has_key?("id")
          if project_json["id"] != self.uuid
            errors.add(:project_json, "id doesn't match provided uuid")
          end
        else
          errors.add(:project_json, "must have id key")
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
        end
      rescue JSON::ParserError
        errors.add(:project_json, "is not valid JSON")
      end
    end
  end

  def meta
    {
      uuid: self.uuid,
      title: self.title,
      description: self.description,
      downloads: self.downloads,
      username: self.user.username,
      screenshot: self.screenshot
    }
  end

  def full
    commit = self.latest_commit
    {
      uuid: self.uuid,
      title: self.title,
      description: self.description,
      downloads: self.downloads,
      username: self.user.username,
      project_json: commit.project_json,
      compiled_code: commit.compiled_code,
      version: commit.id,
      screenshot: self.screenshot
    }
  end
end
