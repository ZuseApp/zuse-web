class RemoveTokenFromSharedProjects < ActiveRecord::Migration
  def up
    remove_column :shared_projects, :token
  end

  def down
    add_column :shared_projects, :token
    add_index :shared_projects, :token
  end
end
