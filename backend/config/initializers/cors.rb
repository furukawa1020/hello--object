Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*" # In production, this should be restricted to the frontend domain

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
