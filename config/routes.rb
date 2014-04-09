Myapp::Application.routes.draw do
 
  ############
  # API
  ############

  # User registration/authentication
  post "/api/v1/user/register" => "api_users#register"
  post "/api/v1/user/auth" => "api_users#authenticate"

  # User specific project access
  resources :projects, param: :uuid, path: "/api/v1/user/projects", controller: :api_user_projects, except: [ :edit, :new ]

  # General project access
  get "/api/v1/projects" => "api_projects#index"
  get "/api/v1/projects/:uuid" => "api_projects#show"
  get "/api/v1/projects/:uuid/download" => "api_projects#download"
  get "/api/v1/projects/:uuid/fork" => "api_projects#fork"

  # Shared project access
  resources :shared_projects, path: "/api/v1/shared_projects", controller: :api_shared_projects, only: [ :create ]
  
  
  ############
  # Non API
  ############
  resources :shared_projects, only: [ :show ]
  resources :projects, only: [ :show ]

  root 'page#index'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
