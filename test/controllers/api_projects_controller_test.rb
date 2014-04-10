require 'test_helper'

class ApiProjectsControllerTest < ActionController::TestCase

  def setup
    @user = FactoryGirl.create(:user)

    @projects = []

    (1..30).each do |i|
      @projects << FactoryGirl.create(:project, { user_id: @user.id } )
    end
  end

  def teardown
    Project.destroy_all
  end

  test "Index: No params" do
    # @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index

    assert_response :ok
    res = JSON.parse @response.body
    assert_equal 10, res.size
  end

  test "Index: Page params" do
    # @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index, { page: 2 }

    assert_response :ok
    res = JSON.parse @response.body
    assert_equal 10, res.size
  end

  test "Index: Page per_page" do
    # @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index, { page: 2, per_page: 3 }

    assert_response :ok
    res = JSON.parse @response.body
    assert_equal 3, res.size
  end

  test "Index: Most Popular" do
    @projects[0].downloads = 10
    @projects[0].save!

    @projects[3].downloads = 5
    @projects[3].save!

    @projects[17].downloads = 17
    @projects[17].save!

    # @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index, { page: 1, per_page: 3, category: "popular" }

    assert_response :ok
    res = JSON.parse @response.body
    assert_equal 3, res.size
    assert_equal @projects[17].uuid, res[0]["uuid"]
    assert_equal @projects[0].uuid, res[1]["uuid"]
    assert_equal @projects[3].uuid, res[2]["uuid"]
  end

  test "Index: Newest First" do

    (1..3).each do |i|
      @projects << FactoryGirl.create(:project, { user_id: @user.id } )
      sleep 1
    end

    # @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index, { page: 1, per_page: 3, category: "newest" }

    assert_response :ok
    res = JSON.parse @response.body
    assert_equal 3, res.size
    assert_equal @projects[32].uuid, res[0]["uuid"]
    assert_equal @projects[31].uuid, res[1]["uuid"]
    assert_equal @projects[30].uuid, res[2]["uuid"]
  end

  #test "Index: Requires authorization" do
  #  get :index
  #
  #  assert_response :unauthorized
  #end

  test "Download: Pulls down full project" do
    # @request.headers["Authorization"] = "Token: #{@user.token}"
    
    get :download, uuid: @projects[0].uuid
    
    assert_response :ok

    res = JSON.parse @response.body
    assert_equal 8, res.size
    assert_equal @projects[0].uuid, res["uuid"]
    assert_equal @projects[0].title, res["title"]
    assert_equal @projects[0].description, res["description"]
    assert_equal @projects[0].downloads, res["downloads"]
    assert_equal @projects[0].user.username, res["username"]
    assert_equal @projects[0].commits.first.project_json, res["project_json"]
    assert_equal @projects[0].commits.first.id, res["commit_number"]
    assert_not_nil res["screenshot_url"]
  end

  #test "Download: Requires authorization" do
  #  get :download, uuid: @projects[0].uuid
  #
  #  assert_response :unauthorized
  #end
end
