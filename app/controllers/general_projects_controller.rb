class GeneralProjectsController < ApplicationController
  def index
    @projects = Project.select("uuid, title, description, username, downloads")
    
    if params[:category]
      if params[:newest] == "newest"
        @projects.order("created_at DESC").limit(10) 
      elsif params[:category] == "popular"
        @projects.order("downloads DESC").limit(10)
      end
    end

    render json: @projects, status: :ok
  end

  def show
    @project = Project.select("uuid, title, description, username, downloads").where("uuid = ?", params[:uuid])

    if @project
      render json: @project, status: :ok
    else
      head :not_found
    end
  end

  def download
    @project = Project
  end

  def fork
  end
end
