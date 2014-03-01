require 'test_helper'

class GeneralProjectsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get show" do
    get :show
    assert_response :success
  end

  test "should get download" do
    get :download
    assert_response :success
  end

  test "should get fork" do
    get :fork
    assert_response :success
  end

end
