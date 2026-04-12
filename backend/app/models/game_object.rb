class GameObject
  attr_reader :id, :name, :description

  def initialize(id:, name:, description:)
    @id = id
    @name = name
    @description = description
    @instance_vars = {}
  end

  # Returns a hash of instance variables for the frontend
  def state
    vars = {}
    instance_variables.each do |var|
      # Skip standard internals if needed
      next if [:@id, :@name, :@description].include?(var)
      vars[var.to_s.delete('@')] = instance_variable_get(var)
    end
    {
      id: @id,
      name: @name,
      description: @description,
      class_name: self.class.name,
      variables: vars
    }
  end

  # This is the "Conversation" hook.
  # It allows us to track what happened during a method call.
  def talk(method_name, *args)
    if respond_to?(method_name)
      send(method_name, *args)
    else
      raise NoMethodError, "このオブジェクト（#{@name}）はその言葉（#{method_name}）を知らないようです。"
    end
  end
end
