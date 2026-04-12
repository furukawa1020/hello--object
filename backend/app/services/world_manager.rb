class WorldManager
  # For now, we use a class-level variable to store the state for the prototype.
  # in a real app, this would be per-user session stored in Redis/DB.
  @registry = {}

  def self.initialize_world
    door = Door.new(id: 'door_001', name: '古びた木の扉', description: 'どこかへ続いているかもしれない頑丈なドア。')
    @registry = {
      'door' => door
    }
  end

  def self.get_object(name)
    @registry[name]
  end

  def self.all_objects
    @registry.values
  end

  def self.reset
    initialize_world
  end

  def self.registry
    @registry
  end
end

# Initialize on load
WorldManager.initialize_world
