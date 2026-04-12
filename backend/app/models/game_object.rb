class GameObject
  attr_reader :id, :name, :description

  def initialize(id:, name:, description:)
    @id = id
    @name = name
    @description = description
    @notes = []
  end

  def note(text)
    @notes << text
    "メモを記録しました: \"#{text}\""
  end

  # Emit a visual/game event to the frontend
  def emit(event_name, data = {})
    Engine::EventRecorder.record(event_name, data.merge(object_id: @id))
  end

  # Returns a hash of instance variables for the frontend
  def state
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
    
    {
      id: @id,
      name: @name,
      description: @description,
      class_name: self.class.name,
      variables: vars,
      notes: @notes
    }
  end

  # This is the "Conversation" hook.
  def talk(method_name, *args)
    if respond_to?(method_name)
      send(method_name, *args)
    else
      raise NoMethodError, "このオブジェクト（#{@name}）はその言葉（#{method_name}）を知らないようです。"
    end
  end
end
