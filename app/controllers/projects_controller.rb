class ProjectsController < ApplicationController
  layout "projects"

  def show
    @project = Project.find_by_id params[:id]
    @commit = @project.latest_commit

    if @project.nil?
      redirect_to "/404.html", status: :not_found
    end

    @project.downloads = @project.downloads + 1
    @project.project_json = @commit.project_json
    @project.compiled_components = @commit.compiled_components
    @project.save
  end

end
