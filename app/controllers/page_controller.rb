class PageController < ApplicationController

  before_filter :setup_pagination
  
  def browse
    @projects = Project.shared
    
    if params[:category]
      if params[:category] == "newest"
        @projects = @projects.order("created_at DESC") 
      elsif params[:category] == "popular"
        @projects = @projects.order("downloads DESC")
      end
    else
       @projects = @projects.order("downloads DESC")
    end

    # Paginate
    @projects = @projects.page(params[:page]).per(params[:per_page])
  end

  def tutorial
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
