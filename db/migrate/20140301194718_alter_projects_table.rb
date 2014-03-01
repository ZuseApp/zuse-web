class AlterProjectsTable < ActiveRecord::Migration
  def up
    add_column :projects, :uuid, :string, unique: true
    add_column :projects, :downloads, :integer
    remove_column :projects, :code
    add_reference :projects, :user, index: true
  end

  def down
    remove_column :projects, :uuid
    remove_column :projects, :downloads
    add_column :projects, :code
    remove_reference :projects, :user
  end
end
