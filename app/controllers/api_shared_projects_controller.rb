class ApiSharedProjectsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    @shared_project = SharedProject.new shared_project_params

    if @shared_project.save
      render json: { url: shared_project_url(@shared_project) }, status: :created
    else
      render json: { errors: @shared_project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private
  def shared_project_params
    params.require(:shared_project).permit(:project_json, :compiled_code)
  end
end
