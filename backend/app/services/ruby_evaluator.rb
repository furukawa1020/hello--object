class RubyEvaluator
  def self.evaluate(code)
    begin
      Engine::EventRecorder.start_session
      
      context = EvalContext.new(WorldManager.registry)
      # We use instance_eval to execute code in the context of the world objects
      result = context.instance_eval(code)
      
      events = Engine::EventRecorder.collect
      
      {
        success: true,
        result: result,
        events: events,
        objects: WorldManager.all_objects.map(&:state)
      }
    rescue StandardError, ScriptError => e
      {
        success: false,
        error: e.message,
        error_type: e.class.name,
        events: Engine::EventRecorder.collect,
        objects: WorldManager.all_objects.map(&:state)
      }
    end
  end

  class EvalContext
    def initialize(registry)
      @registry = registry || {}
      @registry.each do |name, obj|
        instance_variable_set("@#{name}", obj)
      end
    end

    # Allows accessing objects by name (e.g., 'door.open' calls WorldManager.get_object('door').open)
    def method_missing(name, *args, &block)
      if @registry.key?(name.to_s)
        @registry[name.to_s]
      else
        super
      end
    end

    def respond_to_missing?(name, include_private = false)
      @registry.key?(name.to_s) || super
    end
  end
end
