class WorldManager
  @world = Engine::World.new

  def self.initialize_world
    @world.clear
    
    # Use the Ruby DSL to define the scene
    @world.scene :the_first_room do
      door :door_001, '古びた木の扉', 'どこかへ続いているかもしれない頑丈なドア。', locked: true, open: false
      
      # Add the new Chest and Key for deeper logic
      k = key :key_001, '黄金の鍵', '何かのチェストを開けられそうな小さな鍵。'
      c = chest :chest_001, '鉄のチェスト', '重厚な鉄で作られたチェスト。'
      
      c.add_item(k)
    end
  end

  def self.get_object(name)
    # Map 'door' to 'door_001' etc for easy typing in the prototype
    id = case name.to_s
         when 'door' then 'door_001'
         when 'chest' then 'chest_001'
         when 'key' then 'key_001'
         else name.to_s
         end
    @world.find_object(id)
  end

  def self.all_objects
    @world.objects.values
  end

  def self.registry
    # Compatibility with Evaluator's EvalContext
    {
      'door' => get_object('door'),
      'chest' => get_object('chest'),
      'key' => get_object('key')
    }
  end

  def self.reset
    initialize_world
  end
end

# Initialize on load
WorldManager.initialize_world
