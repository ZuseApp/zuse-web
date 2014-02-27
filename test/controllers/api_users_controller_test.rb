require 'test_helper'

class ApiUsersControllerTest < ActionController::TestCase
  def setup
    @user = FactoryGirl.create(:user)
  end

  test "register: should create new user" do
    post :register, user: FactoryGirl.attributes_for(:user) 
    assert_response :created
    
    res = JSON.parse @response.body
    assert_equal 1, res.size
    assert_not_nil res["token"]
  end

  test "register: should fail because missing attributes" do
    post :register, user: { username: "", email: "", password: "", password_confirmation: "" }
    assert_response :unprocessable_entity

    res = JSON.parse @response.body
    assert_not_nil res["errors"]
  end

  test "register: should fail because username and email already taken" do
    post :register, user: FactoryGirl.attributes_for(:user, { username: @user.username, email: @user.email })
    assert_response :unprocessable_entity

    res = JSON.parse @response.body
    assert_not_nil res["errors"]
    assert_equal 2, res["errors"].size
  end

  test "register: should fail because password confirm blank" do
    post :register, user: FactoryGirl.attributes_for(:user, { password_confirmation: "" })
    assert_response :unprocessable_entity

    res = JSON.parse @response.body
    assert_not_nil res["errors"]
    assert_equal 2, res["errors"].size
  end

  test "register: should fail because password confirm doesn't match" do
    post :register, user: FactoryGirl.attributes_for(:user, { password_confirmation: "blah" })
    assert_response :unprocessable_entity

    res = JSON.parse @response.body
    assert_not_nil res["errors"]
    assert_equal 1, res["errors"].size
  end

  test "authenticate: should get user token" do
    post :authenticate, user: { username: @user.username, password: @user.password }
    assert_response :ok

    res = JSON.parse @response.body
    assert_equal 1, res.size
    assert_not_nil res["token"]
  end

  test "authenticate: bad password should fail" do
    post :authenticate, user: { username: @user.username, password: "balh" }
    assert_response :unauthorized
  end

end
