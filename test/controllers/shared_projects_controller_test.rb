require 'test_helper'

class SharedProjectsControllerTest < ActionController::TestCase
  def setup
    @shared_project = FactoryGirl.create(:shared_project)
  end

  test "should get shared project" do
    get :show, id: @shared_project.id
    assert_response :ok
  end

  test "should get 404" do
    get :show, id: 0
    assert_response :not_found
  end

  test "should get url" do
    post :create, shared_project: FactoryGirl.attributes_for(:shared_project)
    assert_response :created

    res = JSON.parse @response.body
    assert res.has_key? ("url")
  end

end
