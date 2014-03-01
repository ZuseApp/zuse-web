class CreateCommits < ActiveRecord::Migration
  def change
    create_table :commits do |t|
      t.references :project, index: true
      t.string :ancestry, index: true
      t.text :project_json
      t.text :compiled_code

      t.timestamps
    end
  end
end
