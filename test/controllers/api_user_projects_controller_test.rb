require 'test_helper'

class ApiUserProjectsControllerTest < ActionController::TestCase 
  def setup
    @user = FactoryGirl.create(:user)
    (1..10).each do |i|
      @project = FactoryGirl.create(:project, { user_id: @user.id } )
    end

    @user2 = FactoryGirl.create(:user)
    (1..10).each do |i|
      @project2 = FactoryGirl.create(:project, { user_id: @user2.id } )
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

  test "Create: Should return errors" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    post :create, project: FactoryGirl.attributes_for(:project, project_json: "")
    assert_response :unprocessable_entity

    response = JSON.parse @response.body
    assert_not_nil response
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

  test "Update: Project meta must match information in project_json" do
    project_state = @project.full
    @request.headers["Authorization"] = "Token: #{@user.token}"
    put :update, { uuid: @project.uuid, project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                                 description: "My description", 
                                                                                 project_json: project_state[:project_json], 
                                                                                 compiled_code: project_state[:compiled_code] }) }
    assert_response :unprocessable_entity
    response = JSON.parse @response.body

    assert_not_nil response["errors"]
  end

  test "Update: Changes to project_json and project meta updates project" do
    project_state = @project.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    @request.headers["Authorization"] = "Token: #{@user.token}"
    put :update, { uuid: @project.uuid, project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                                 description: "My description", 
                                                                                 project_json: project_state[:project_json], 
                                                                                 compiled_code: project_state[:compiled_code] }) }
    assert_response :no_content
    @project.reload
    assert_equal 2, @project.commits.count
  end

  test "Update: Requires authorization" do
    project_state = @project.full
    put :update, { uuid: @project.uuid, project: FactoryGirl.attributes_for(:project, { title: project_state[:title], 
                                                                                 description: project_state[:description], 
                                                                                 project_json: project_state[:project_json], 
                                                                                 compiled_code: project_state[:compiled_code] }) }
    assert_response :unauthorized
  end

  test "Update: Requires project ownership" do
    project_state = @project.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    @request.headers["Authorization"] = "Token: #{@user2.token}"
    put :update, { uuid: @project.uuid, project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                                 description: "My description", 
                                                                                 project_json: project_state[:project_json], 
                                                                                 compiled_code: project_state[:compiled_code] }) }
    assert_response :forbidden
  end

  test "Destroy: Requires authorization" do
    delete :destroy, uuid: @project.uuid
    assert_response :unauthorized
  end

  test "Destroy: Requires project ownership" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    delete :destroy, uuid: @project2.uuid
    assert_response :forbidden
  end

  test "Destroy: Should be successful" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    delete :destroy, uuid: @project.uuid
    assert_response :no_content
    
    assert_equal 9, @user.projects.count
  end

end
