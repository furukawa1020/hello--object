class GameObject
  attr_reader :id, :name, :description

  def initialize(id:, name:, description:)
    @id = id
    @name = name
    @description = description
    @notes = []
    @scene_id = nil
    @variables = {}
  end

  def set_scene(scene_id)
    @scene_id = scene_id
  end

  def note(text)
    # ...
  end

  # Emit a visual/game event to the frontend
  def emit(event_name, data = {})
    Engine::EventRecorder.record(event_name, data.merge(object_id: @id))
  end

  # Returns a hash of instance variables for the frontend
  def state
    state_hash
  end

  def state_hash
    {
      id: @id,
      name: @name,
      description: @description,
      class_name: self.class.name,
      variables: variable_state,
      notes: @notes,
      scene_id: @scene_id,
      actions: ui_actions,
      schematic: ui_schematic,
      labels: ui_labels,
      alias_name: WorldManager::ALIASES.key(@id) || @id,
      sprite: ui_sprite,
      tooltip: ui_tooltip,
      completed: completed?
    }
  end

  def variables
    @variables
  end

  def register!
    Engine::EventRecorder.world.add_object(self)
    "#{self.class.name} '#{@name}' が具現化されました。"
  end

  # Default visual representation (moves from JS to Ruby)
  def ui_sprite
    "<div class='generic-sprite'>#{@name[0]}</div>"
  end

  # Default tooltip data
  def ui_tooltip
    {
      name: @name,
      class_name: self.class.name,
      description: @description
    }
  end

  # Default completion logic
  def completed?
    false
  end

  # Default actions
  def ui_actions
    []
  end

  # Default labels describing current state for UI (moves from JS)
  def ui_labels
    []
  end

  # Default schematic
  def ui_schematic
    return schematic if respond_to?(:schematic)
    nil
  end

  def engine
    EngineFacade.new
  end

  private

  def variable_state
    vars = {}
    instance_variables.each do |var|
      # Skip standard internals and parent references to avoid cycles
      next if [:@id, :@name, :@description, :@parent, :@notes].include?(var)
      val = instance_variable_get(var)
      
      # Handle collections of objects
      if val.is_a?(Array)
        vars[var.to_s.delete('@')] = val.map { |v| v.is_a?(GameObject) ? v.id : v }
      else
        vars[var.to_s.delete('@')] = val
      end
    end
    vars
  end

  def talk(method_name, *args)
    # ...
    if respond_to?(method_name)
      send(method_name, *args)
    else
      raise NoMethodError, "このオブジェクト（#{@name}）はその言葉（#{method_name}）を知らないようです。"
    end
  end

  class EngineFacade
    def world
      Engine::EventRecorder.world
    end

    def record_event(event_name, message = nil, payload = {})
      data = payload.dup
      data[:message] = message if message
      Engine::EventRecorder.record(event_name, data)
    end
  end
end
