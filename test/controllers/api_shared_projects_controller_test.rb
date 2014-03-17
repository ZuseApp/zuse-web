require 'test_helper'

class ApiSharedProjectsControllerTest < ActionController::TestCase
  def setup
    @shared_project = FactoryGirl.create(:shared_project)
  end

  test "Create: Should get url" do
    post :create, shared_project: FactoryGirl.attributes_for(:shared_project, description: "")
    assert_response :created

    res = JSON.parse @response.body
    assert_not_nil res["url"]
  end

  test "Create: Should get errors" do
    post :create, shared_project: FactoryGirl.attributes_for(:shared_project, title: "", project_json: "", compiled_code: "" )
    assert_response :unprocessable_entity

    res = JSON.parse @response.body
    assert_not_nil res["errors"]
  end
end
