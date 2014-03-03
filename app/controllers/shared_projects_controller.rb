class SharedProjectsController < ApplicationController
  layout "shared_projects"
  

  def show
    @shared_project = SharedProject.find_by_id params[:id]

    if @shared_project.nil?
      redirect_to "/404.html", status: :not_found
    end
  end
end
