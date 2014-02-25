class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  private
  def authenticate_api_request
    token = request.headers["Authorization"]
    
    if token.nil?
      head :unauthorized
    else
      token = token.gsub("Token:","").strip()

      if token.empty?
        head :unauthorized
      else
        @api_user = User.find_by_token token
      end
    end
  end

end
