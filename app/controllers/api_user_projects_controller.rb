class ApiUserProjectsController < ApplicationController
  before_filter :set_screenshot_base64, only: [ :create, :update ]
  before_filter :authenticate_api_request
  before_filter :setup_pagination, only: [ :index ]
  skip_before_filter :verify_authenticity_token


  def index
    @projects = @api_user.projects.page(params[:page]).per(params[:per_page])
    render json: @projects.map { |p| p.meta }, status: :ok
  end

  def create
    @project = @api_user.projects.find_by_uuid params[:project][:uuid]

    if @project
      @fork = @project.fork @api_user, nil

      if @fork.errors.any?
        render json: { errors: @fork.errors.full_messages }, status: :unprocessable_entity
      else
        render json: @fork.full, status: :ok
      end
    else
      @project = @api_user.projects.new user_create_params
    
      if @project.save
        render json: @project.full, status: :ok
      else
        render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
      end
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
      if @project.update_attributes user_update_params
        render json: @project.full, status: :ok
      else
        render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
      end
    else
      @project = Project.find_by_uuid params[:uuid]
      @fork = @project.fork_from_version @api_user, params[:version]

      if @fork.errors.any?
        render json: { errors: @fork.errors.full_messages }, status: :unprocessable_entity
      else
        render json: @fork.full, status: :ok
      end
    end
  end

  def destroy
    @project = @api_user.projects.find_by_uuid params[:uuid]

    if @project.nil?
      head :forbidden
    elsif @project.deleted
      head :not_found
    else
      @project.deleted = true
      @commit = @project.latest_commit
      @project.project_json = @commit.project_json
      @project.compiled_code = @commit.compiled_code

      if @project.save
        head :no_content
      else
        head :unprocessable_entity
      end
    end
  end

  private
  def user_create_params
    params.require(:project).permit(:project_json, :compiled_code, :title, :description, :uuid, :screenshot_base64, :screenshot)
  end

  def user_update_params
    params.require(:project).permit(:project_json, :compiled_code, :title, :description, :screenshot_base64, :screenshot)
  end

  def set_screenshot_base64
    return if params[:project][:screenshot].blank?
    
    params[:project][:screenshot_base64] = params[:project][:screenshot]
    params[:project][:screenshot] = nil
  end

  def setup_pagination
    if params[:page].nil?
      params[:page] = 1
    end

    if params[:per_page].nil?
      params[:per_page] = 10
    end
  end

end
