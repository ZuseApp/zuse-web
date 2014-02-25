class AddIndexToTokenOnSharedProjects < ActiveRecord::Migration
  def change
    add_index :shared_projects, :token
  end
end
