class GameObject
  attr_reader :id, :name, :description

  def initialize(id:, name:, description:)
    @id = id
    @name = name
    @description = description
    @notes = []
    @scene_id = nil
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
    {
      id: @id,
      name: @name,
      description: @description,
      class_name: self.class.name,
      variables: variable_state,
      notes: @notes,
      scene_id: @scene_id,
      actions: ui_actions,
      schematic: ui_schematic
    }
  end

  def register!
    Engine::EventRecorder.world.add_object(self)
    "#{self.class.name} '#{@name}' が具現化されました。"
  end

  # Default actions - can be overridden in subclasses
  def ui_actions
    []
  end

  # Default schematic - can be overridden
  def ui_schematic
    nil
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
end
