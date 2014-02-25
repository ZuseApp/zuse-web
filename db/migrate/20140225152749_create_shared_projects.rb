class CreateSharedProjects < ActiveRecord::Migration
  def change
    create_table :shared_projects do |t|
      t.string :title
      t.text :description
      t.text :raw_code
      t.text :compiled_code
      t.string :token, unique: true

      t.timestamps
    end
  end
end
