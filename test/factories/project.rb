FactoryGirl.define do
  factory :project do
    title "Hello world"
    description ""
    downloads 0
    uuid { SecureRandom.uuid }
    project_json { '{ "title" : "' + title + '", "description" : "' + description + '", "id" : "' + uuid + '" }' }
    compiled_code '{}'
    screenshot ""
  end
end
