class SharedProjectsController < ApplicationController
  layout "shared_projects"
  skip_before_filter :verify_authenticity_token, only: [ :create ]

  def create
    @shared_project = SharedProject.new shared_project_params

    if @shared_project.save
      render json: { url: shared_project_url(@shared_project) }, status: :created
    else
      render json: @shared_project.errors, status: :unprocessable_entity
    end
  end

  def show
    @shared_project = SharedProject.find_by_id params[:id]

    if @shared_project.nil?
      redirect_to "/404.html", status: :not_found
    end

  end

  private
  def shared_project_params
    params.require(:shared_project).permit(:title, :description, :raw_code, :compiled_code)
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
end
