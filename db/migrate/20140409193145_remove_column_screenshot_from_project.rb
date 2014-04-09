class RemoveColumnScreenshotFromProject < ActiveRecord::Migration
  def up
    remove_column :projects, :screenshot
  end

  def down
    add_column :projects, :screenshot, :text
  end
end
