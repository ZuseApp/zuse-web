class SharedProjectsController < ApplicationController
  layout "shared_projects"
  

  def show
    @shared_project = SharedProject.find_by_id params[:id]
    project_json = JSON.parse @shared_project.project_json
    @title = project_json["title"]
    @description = project_json["description"]

    if @shared_project.nil?
      redirect_to "/404.html", status: :not_found
    end
  end

  def index
    @title = "Home"
    @shared_project = SharedProject.find_by_id 34
  end
end
