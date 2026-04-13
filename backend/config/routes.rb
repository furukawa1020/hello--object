Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  post 'execute', to: 'execution#execute'
  post 'analyze', to: 'execution#analyze'
  get  'state',   to: 'execution#state'
  post 'reset',   to: 'execution#reset'
  get  'methods', to: 'execution#methods_for'

  # Serve the frontend
  root 'static#index'
  get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
