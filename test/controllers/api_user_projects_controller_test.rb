require 'test_helper'

class ApiUserProjectsControllerTest < ActionController::TestCase 
  def setup
    @user = FactoryGirl.create(:user)
    (1..10).each do |i|
      @project = FactoryGirl.create(:project, { user_id: @user.id } )
    end

    @project_deleted = FactoryGirl.create(:project, { user_id: @user.id, deleted: true })

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

  test "Index: Should return only shared projects" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    get :index, { per_page: 100 }

    assert_response :ok
    res = JSON.parse @response.body
    assert 11, res.size

    res.each do |project|
      assert project["uuid"] != @project_deleted.uuid
    end
  end

  test "Index: Requires authorization" do
    get :index
    assert_response :unauthorized
  end

  test "Create: Should return ok" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    post :create, project: FactoryGirl.attributes_for(:project)
    assert_response :ok

    res = JSON.parse @response.body
    assert_equal 8, res.size 
  end

  test "Create: Previously shared, but now unshared, is now shared" do
    commit = @project_deleted.latest_commit
    project_attributes = @project_deleted.full
    project_attributes[:compiled_components] = commit.compiled_components

    @request.headers["Authorization"] = "Token: #{@user.token}"
    
    post :create, project: project_attributes
    assert_response :ok

    @project_deleted.reload
    res = JSON.parse @response.body
    assert_equal 8, res.size
    assert !@project_deleted.deleted
  end

  test "Create: Can't create an already shared project" do
    commit = @project.latest_commit
    project_attributes = @project.full
    project_attributes[:compiled_components] = commit.compiled_components
    
    @request.headers["Authorization"] = "Token: #{@user.token}"
    
    post :create, project: project_attributes
    assert_response :conflict
  end


  test "Create: With screenshot" do
    @request.headers["Authorization"] = "Token: #{@user.token}"
    post :create, project: FactoryGirl.attributes_for(:project, { screenshot: "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVQI12O82dHx+8sXli937vx+/x4ARKkKV16Ef5MAAAAASUVORK5CYII="})
    
    res = JSON.parse @response.body
    assert_response :ok
    assert_equal 8, res.size
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
    assert_equal 8, res.size
    assert_not_nil res["uuid"]
    assert_not_nil res["title"]
    assert_not_nil res["description"]
    assert_not_nil res["downloads"]
    assert_not_nil res["project_json"]
    assert_not_nil res["screenshot_url"]
    assert_not_nil res["commit_number"]
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

  test "Show: Can't find unshared project" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    get :show, uuid: @project_deleted.uuid
    assert_response :not_found
  end

  test "Show: Can't find nonexistent project" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    get :show, uuid: SecureRandom.uuid
    assert_response :forbidden
  end

  test "Update: Project meta must match information in project_json" do
    project_state = @project.full
    @request.headers["Authorization"] = "Token: #{@user.token}"
    put :update, { uuid: @project.uuid, 
                   project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey",
                                                                   description: "My description", 
                                                                   project_json: project_state[:project_json] }) }
    assert_response :unprocessable_entity
    response = JSON.parse @response.body

    assert_not_nil response["errors"]
  end

  test "Update: If project deleted not found" do
    project_state = @project_deleted.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    project_state[:compiled_components] = "{ \"hello\" : 1 }"

    @request.headers["Authorization"] = "Token: #{@user.token}"
    
    put :update, { uuid: @project_deleted.uuid, 
                   project: project_state }

    assert_response :not_found
  end

  test "Update: Changes to project_json and project meta updates project" do
    project_state = @project.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    @request.headers["Authorization"] = "Token: #{@user.token}"
    put :update, { uuid: @project.uuid, 
                   project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey",
                                                                   description: "My description", 
                                                                   project_json: project_state[:project_json],
                                                                   commit_number: project_state[:commit_number]})}
    assert_response :ok
    res = JSON.parse @response.body
    @project.reload
    assert_equal 8, res.size
    assert_equal 2, @project.commits.count
    assert_nil @project.commits.first.parent
    assert_equal @project.commits.first.id, @project.commits.last.parent.id
  end

  test "Update: Requires authorization" do
    project_state = @project.full
    put :update, { uuid: @project.uuid, 
                   project: FactoryGirl.attributes_for(:project, { title: project_state[:title],
                                                                   description: project_state[:description], 
                                                                   project_json: project_state[:project_json] }) }
    assert_response :unauthorized
  end

  test "Update: Requires project version on fork" do
    project_state = @project.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    @request.headers["Authorization"] = "Token: #{@user2.token}"
    put :update, { uuid: @project.uuid, 
                   project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                   description: "My description", 
                                                                   project_json: project_state[:project_json] }) }
    assert_response :unprocessable_entity
    res = JSON.parse @response.body
    
    assert_equal 1, res["errors"].size
    assert_equal "Commit number can't be blank", res["errors"][0]
  end

  test "Update: Forks properly" do
    project_state = @project.full
    project_state[:project_json] = '{ "title" : "Howdy Dudey", "description" : "My description", "id" : "' + @project.uuid + '" }'
    @request.headers["Authorization"] = "Token: #{@user2.token}"
    put :update, { uuid: @project.uuid, 
                   project: FactoryGirl.attributes_for(:project, { title: "Howdy Dudey", 
                                                                   description: "My description", 
                                                                   project_json: project_state[:project_json],
                                                                   commit_number: project_state[:commit_number] }) }
    
    res = JSON.parse @response.body
    assert_response :ok
    @fork = @user2.projects.find_by_uuid res["uuid"]
    assert_equal 8, res.size
    assert_not_equal project_state[:uuid], res["uuid"]
    assert_nil @user2.projects.find_by_uuid project_state[:uuid]
    assert_equal 11, @user2.projects.size
    assert_equal 1, @fork.commits.size
    assert_equal @project.latest_commit.id, @fork.latest_commit.parent.id
    assert_equal project_state[:commit_number], @fork.commits.last.parent.id
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

  test "Destroy: Requires project be shared" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    delete :destroy, uuid: @project_deleted.uuid
    assert_response :not_found
  end

  test "Destroy: Should be successful" do
    @request.headers["Authorization"] = "Token: #{@user.token}"

    delete :destroy, uuid: @project.uuid
    assert_response :ok
    
    assert_equal 9, @user.projects.where(deleted: false).count
    assert_equal 1, @user.projects.where(deleted: true).first.commits.count
  end

end
