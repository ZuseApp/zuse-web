if Rails.env.production?
  Url = "http://zusehub.com"
else
  Url = "http://localhost:3000"
end
