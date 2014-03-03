class ApiProjectsController < ApplicationController
  before_filter :authenticate_api_request
  skip_before_filter :verify_authenticity_token
  
  def index
    @projects = Project.select("*")
    
    if params[:category]
      if params[:newest] == "newest"
        @projects.order("created_at DESC").limit(10) 
      elsif params[:category] == "popular"
        @projects.order("downloads DESC").limit(10)
      end
    end

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
end
