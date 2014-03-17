class ApiProjectsController < ApplicationController
  before_filter :authenticate_api_request
  skip_before_filter :verify_authenticity_token
  before_filter :setup_pagination
  
  def index
    @projects = Project.select("*")
    
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
    @project = Project.find_by_uuid params[:uuid]

    if @project
      render json: @project.meta, status: :ok
    else
      head :not_found
    end
  end

  def download
    @project = Project.find_by_uuid params[:uuid]

    if @project
      render json: @project.full, status: :ok
    else
      head :not_found
    end
  end

  # TODO
  def fork
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
