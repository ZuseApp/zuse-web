class ApiUsersController < ApplicationController

  skip_before_filter :verify_authenticity_token
  
  def register
    @user = User.new register_params

    if @user.save
      render json: { token: @user.token }, status: :created 
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def authenticate
    @user = User.find_by_username params[:user][:username]

    if @user && @user.authenticate params[:user][:password]
      render json: { token: @user.token }, status: :ok
    else
      head :unauthorized
    end
  end

  private

  def register_params
    params.require(:user).permit(:username, :email, :password, :password_confirmation)
  end
  
end
