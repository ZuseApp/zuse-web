class User < ActiveRecord::Base
  has_many :projects
  
  
  has_secure_password
  validates :username, :email, presence: true, on: :create
  validates :username, :email, uniqueness: true
  
  before_create do |user|
    user.token = SecureRandom.urlsafe_base64 30, true
  end
end
