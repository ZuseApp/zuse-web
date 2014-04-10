class Project < ActiveRecord::Base
  belongs_to :user
  has_many :commits

  scope :shared, -> { where(deleted: false) }

  attr_accessor :project_json
  attr_accessor :compiled_components
  attr_accessor :screenshot_base64

  has_attached_file :screenshot, { styles: 
                                   { 
                                     half: "x262", 
                                     quarter: "x131", 
                                     eighth: "x65"
                                   },
                                   default_url: "/missing/screenshot/:style.png"}

  validates :user, :title, :uuid, presence: true
  validates :uuid, uniqueness: true
  validate :compiled_components_is_valid
  validate :project_json_is_valid_and_fields_match
  validates_attachment :screenshot, { 
                         content_type: { content_type: "image/png" },
                         size: { less_than_or_equal_to: 100.kilobytes } }
  do_not_validate_attachment_file_type :screenshot

  after_create :create_commit
  before_update :update_or_create_commit
  before_validation :decode_screenshot_base64

  def create_commit
    commit = Commit.new
    commit.project_json = self.project_json
    commit.compiled_components = self.compiled_components
    commit.project = self
    commit.save!
  end

  def latest_commit
    self.commits.order("updated_at DESC").first
  end

  def update_or_create_commit
    commit = self.latest_commit

    if commit.is_childless?
      if commit.needs_update? self.project_json, self.compiled_components
        new_commit = Commit.new
        new_commit.project_json = self.project_json
        new_commit.compiled_components = self.compiled_components
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

  def fork_from_commit_number user, commit_number
    if commit_number.nil?
      self.errors.add :commit_number, "can't be blank"
      return self
    end

    self.fork user, commit_number
  end

  def fork user, commit_number
    begin
      if user.nil?
        self.errors.add :user, "can't be blank"
        return self
      end
      
      uuid = SecureRandom.uuid
      
      if commit_number.nil?
        commit_parent = self.latest_commit
      else
        commit_parent = Commit.find_by_id commit_number
      end

      project_json = JSON.parse commit_parent.project_json
      project_json["id"] = uuid
      
      new_project = self.dup

      new_project.uuid = uuid
      new_project.project_json = project_json.to_json
      new_project.compiled_components = commit_parent.compiled_components
      new_project.user = user
      new_project.deleted = false
     
      if new_project.save
        commit_child = new_project.latest_commit

        if commit_number
          commit_child.parent = commit_parent
        end

        if !commit_child.save
          new_project.destroy
          return commit_child
        end
      end

      new_project
    rescue JSON::ParserError
      new_project.errors.add(:project_json, "is not valid JSON")
      new_project
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
      screenshot_url: Url + self.screenshot.url(:quarter),
      commit_number: self.latest_commit.id
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
      commit_number: commit.id,
      screenshot_url: Url + self.screenshot.url(:quarter)
    }
  end

  def decode_screenshot_base64
    return if self.screenshot_base64.blank?
    
    decoded_data = Base64.decode64 self.screenshot_base64
    
    data = StringIO.new(decoded_data)
    
    self.screenshot = data
    self.screenshot_file_name = "screenshot.png"
  end

  def increment_download_count
    @commit = self.latest_commit
    self.project_json = @commit.project_json
    self.compiled_components = @commit.compiled_components
    self.downloads = self.downloads + 1
    self.save
  end
end
