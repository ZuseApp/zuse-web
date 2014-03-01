class ProjectsController < ApplicationController
  before_filter :authenticate_api_request, except: [ :index, :show ]

  def index
    @projects = Project.all
    render json: @projects
  end

  def create
    if @api_user
      @project = @api_user.projects.new user_params

      if @project.save
        render json: @project
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    end

  end

  def show
    @project = Project.find_by_id params[:id]
    render json: @project, status: :ok
  end

  def update
    if @api_user
      @project = @api_user.projects.find_by_id params[:id]

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
  end

  def destroy
    if @api_user
      @project = @api_user.projects.find_by_id params[:id]

      if @project
        @project.destroy
        head :no_content
      else
        head :forbidden
      end
    end
  end

  private
  def user_params
    params.require(:project).permit(:title, :description, :code)
  end

end
