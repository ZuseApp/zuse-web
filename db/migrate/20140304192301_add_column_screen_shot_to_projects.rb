class AddColumnScreenShotToProjects < ActiveRecord::Migration
  def change
    add_column :projects, :screenshot, :text
  end
end
