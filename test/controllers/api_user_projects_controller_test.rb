require 'test_helper'

class ApiUserProjectsControllerTest < ActionController::TestCase 
  def setup
    @user = FactoryGirl.create(:user)
    [1..10].each do |i|
      @project = FactoryGirl.create(:project, { user_id: @user.id } )
    end
  end

  test "Index: Should return all projects user has" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index
    assert_response :ok
  end

  test "Index: Requires authorization" do
    get :index
    assert_response :unauthorized
  end

  test "Create: Should return no content" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    post :create, project: FactoryGirl.attributes_for(:project)
    assert_response :no_content
  end

  test "Create: Requires authorization" do
    post :create, project: FactoryGirl.attributes_for(:project)
    assert_response :unauthorized
  end

  test "Show: Should return a user's specific project" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    get :show, uuid: @project.uuid
    assert_response :ok

    res = JSON.parse @response.body
    assert_equal 6, res.size
    assert_not_nil res["uuid"]
    assert_not_nil res["title"]
    assert_not_nil res["description"]
    assert_not_nil res["downloads"]
    assert_not_nil res["project_json"]
    assert_not_nil res["compiled_code"]
  end

  test "Show: Requires project ownership" do
    user = FactoryGirl.create :user
    project = FactoryGirl.create :project, { user: user }

    @request.headers["Authorization"] = "Token: #{@user.token}"

    get :show, uuid: project.uuid
    assert_response :forbidden
  end

  test "Show: Requires authorization" do
    get :show, uuid: @project.uuid
    assert_response :unauthorized
  end

  test "Update: No changes to project_json or compiled_code only updates project" do
    project_state = @project.full
    puts project_state
    @request.headers["Authorization"] = "Token: #{@user.token}"
    put :update, { uuid: @project.uuid, project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                                 description: "My description", 
                                                                                 project_json: project_state["project_json"], 
                                                                                 compiled_code: project_state["compiled_code"] }) }
    assert_response :no_content
    @project.reload

    assert_equal "Howdy Dudey", @project.title
    assert_equal "My description", @project.description
    assert_equal project_state["project_json"], @project.latest_commit.project_json
    assert_equal project_state["compiled_code"], @project.latest_commit.compiled_code
  end

  test "Update: Changes to project_json updates project" do

  end

  test "Update: Requires authorization" do

  end

  test "Update: Requires project ownership" do

  end

end
