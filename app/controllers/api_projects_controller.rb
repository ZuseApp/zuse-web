class ApiProjectsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :setup_pagination
  
  def index
    @projects = Project.active
    
    if params[:category]
      if params[:category] == "newest"
        @projects = @projects.order("created_at DESC") 
      elsif params[:category] == "popular"
        @projects = @projects.order("downloads DESC")
      end
    end

    # Paginate
    @projects = @projects.page(params[:page]).per(params[:per_page])

    render json: @projects.map { |p| p.meta }, status: :ok
  end

  def show
    @project = Project.active.find_by_uuid params[:uuid]

    if @project
      @project_hash = @project.meta
      @project_hash[:screenshot_url] = @project.screenshot.url(:half)
      render json: @project_hash, status: :ok
    else
      head :not_found
    end
  end

  def download
    @project = Project.active.find_by_uuid params[:uuid]

    if @project
      @project.increment_download_count
      render json: @project.full, status: :ok
    else
      head :not_found
    end
  end

  private

  def setup_pagination
    if params[:page].nil?
      params[:page] = 1
    end

    if params[:per_page].nil?
      params[:per_page] = 10
    end
  end
end
