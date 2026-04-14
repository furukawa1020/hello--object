# Ensures the World state is initialized when the Rails application boots.
Rails.application.config.after_initialize do
  WorldManager.initialize_world
end
