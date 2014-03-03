class ApiUserProjectsController < ApplicationController
  before_filter :authenticate_api_request
  skip_before_filter :verify_authenticity_token

  def index
    @projects = @api_user.projects.all
    render json: @projects.map { |p| p.meta }, status: :ok
  end

  def create
    @project = @api_user.projects.new user_params

    if @project.save
      head :no_content
    else
      render json: @project.errors, status: :unprocessable_entity
    end
  end

  def show
    @project = @api_user.projects.find_by_uuid params[:uuid]

    if @project
      render json: @project.full, status: :ok
    else
      head :forbidden
    end
  end

  def update
    @project = @api_user.projects.find_by_uuid params[:uuid]

    if @project
      if @project.update_attributes user_params
        head :no_content
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    else
      head :forbidden
    end
  end

  def destroy
    @project = @api_user.projects.find_by_id params[:id]

    if @project
      @project.destroy
      head :no_content
    else
      head :forbidden
    end
  end

  private
  def user_params
    params.require(:project).permit(:project_json, :compiled_code)
  end

end
