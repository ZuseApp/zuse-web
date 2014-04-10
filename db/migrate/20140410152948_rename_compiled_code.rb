class RenameCompiledCode < ActiveRecord::Migration
  def change
    rename_column :commits, :compiled_code, :compiled_components
    rename_column :shared_projects, :compiled_code, :compiled_components
  end
end
