class RemoveColumnsFromSharedProjects < ActiveRecord::Migration
  def up
    remove_column :shared_projects, :title
    remove_column :shared_projects, :description
  end

  def down
    add_column :shared_projects, :title
    add_column :shared_projects, :description
  end
end
