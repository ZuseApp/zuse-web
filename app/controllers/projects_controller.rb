class ProjectsController < ApplicationController
  layout "projects"

  def show
    @project = Project.find_by_id params[:id]
    @commit = @project.latest_commit

    if @project.nil?
      redirect_to "/404.html", status: :not_found
    end

    @project.downloads = @project.downloads + 1
    @project.save
  end

end
