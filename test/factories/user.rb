FactoryGirl.define do
  factory :user do
    username { Forgery(:basic).text }
    password "password"
    password_confirmation "password"
    email { Forgery(:internet).email_address }
  end
end
