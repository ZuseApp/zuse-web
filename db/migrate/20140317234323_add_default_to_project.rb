class AddDefaultToProject < ActiveRecord::Migration
  def up
    change_column :projects, :downloads, :integer, :default => 0
    Project.find_each do |p|
      commit = p.latest_commit
      
      p.downloads = 0
      p.project_json = commit.project_json
      p.compiled_code = commit.compiled_code
      p.save!
    end
  end

  def down
    change_column :projects, :downloads, :integer, :default => nil
  end
end
