class AddDefaultToProjectsScreenshot < ActiveRecord::Migration
  def up
    change_column :projects, :screenshot, :text, :default => ""
    Project.find_each do |p|
      commit = p.latest_commit
      
      p.screenshot = ""
      p.project_json = commit.project_json
      p.compiled_code = commit.compiled_code
      p.save!
    end
  end

  def down
    change_column :projects, :screenshot, :text, :default => nil
  end
end
