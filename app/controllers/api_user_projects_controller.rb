class ApiUserProjectsController < ApplicationController
  before_filter :set_screenshot_base64, only: [ :create, :update ]
  before_filter :authenticate_api_request
  before_filter :validate_commit_number, only: [ :update ]
  before_filter :setup_pagination, only: [ :index ]
  skip_before_filter :verify_authenticity_token


  def index
    @projects = @api_user.projects.shared.page(params[:page]).per(params[:per_page])
    render json: @projects.map { |p| p.meta }, status: :ok
  end

  def create
    @project = @api_user.projects.find_by_uuid params[:project][:uuid]

    if @project
      if @project.deleted
        @project.deleted = false

        if @project.update_attributes user_create_params
          render json: @project.full, status: :ok
        else
          render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
        end
      else
        head :conflict
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
      if @project.deleted
        head :not_found
      else
        @project_hash = @project.full
        @project_hash[:screenshot_url] = Url + @project.screenshot.url(:half)
        render json: @project_hash, status: :ok
      end
    else
      head :forbidden
    end
  end

  def update
    @project = @api_user.projects.find_by_uuid params[:uuid]

    if @project
      if @project.deleted
        head :not_found
        return
      else
        if @project.update_attributes user_update_params.except(:commit_number)
          render json: @project.full, status: :ok
        else
          render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
        end
      end
    else
      @project = Project.find_by_uuid params[:uuid]
      @fork = @project.fork_from_commit_number @api_user, params[:project][:commit_number]

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
      @project.compiled_components = @commit.compiled_components

      if @project.save
        head :ok
      else
        head :failed_dependency
      end
    end
  end

  private
  def user_create_params
    params.require(:project).permit(:project_json, 
                                    :compiled_components, 
                                    :title, :description, 
                                    :uuid, 
                                    :screenshot_base64, 
                                    :screenshot)
  end

  def user_update_params
    params.require(:project).permit(:project_json, 
                                    :compiled_components, 
                                    :title, 
                                    :description, 
                                    :screenshot_base64, 
                                    :screenshot,
                                    :commit_number)
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

  def validate_commit_number
    if params[:project][:commit_number].blank?
      render json: { errors: ["Commit number can't be blank"] }, status: :unprocessable_entity
    end
  end
end
