class AlterSharedProject < ActiveRecord::Migration
  def change
    rename_column :shared_projects, :raw_code, :project_json
  end
end
