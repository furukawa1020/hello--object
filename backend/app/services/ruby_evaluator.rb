  @instability = 0

  def self.evaluate(code)
    begin
      Engine::EventRecorder.start_session
      
      # Detect metaprogramming attempts
      is_metaprog = code.include?('class ') || code.include?('define_method') || code.include?('instance_eval')
      @instability += 5 if is_metaprog
      @instability = [@instability - 1, 0].max if !is_metaprog && @instability > 0

      context = EvalContext.new(WorldManager.registry)
      result = context.instance_eval(code)

      events = Engine::EventRecorder.collect
      achievements = Engine::AchievementManager.analyze_execution(code, context)

      {
        success: true,
        result: serialize_result(result),
        result_type: result.class.name,
        events: events,
        achievements: achievements,
        objects: WorldManager.all_objects.map(&:state),
        scenes: WorldManager.world.scene_metadata.values,
        instability: @instability,
        is_victory: WorldManager.world.victory?,
        tutorial: WorldManager.world.tutorial_steps,
        navi_message: Engine::Navi.generate_message(WorldManager.world, @last_result, @last_error)
      }
    rescue StandardError, ScriptError => e
      @instability += 2
      @last_result = nil
      @last_error = e
      achievements = Engine::AchievementManager.analyze_execution(code, nil)
      friendly_msg = case e
                    # ...
                    when NoMethodError
                      method_name = e.message.match(/undefined method [`'](.+)['`] for/)&.[](1)
                      # ... suggestions logic ...
                      method_name = e.message.match(/undefined method [`'](.+)['`] for/)&.[](1)
                      receiver_class = e.message.match(/for an instance of (\w+)|for.*:(\w+)/)&.captures&.compact&.first
                      suggestions = receiver_class ? suggest_methods(receiver_class, method_name) : []
                      hint = suggestions.any? ? "\nもしかして: #{suggestions.map { |m| ".#{m}" }.join(', ')}" : "\n右側の「Actions」ボタンを参考にしてみてください。"
                      "『#{method_name || 'その言葉'}』は、このオブジェクトには通じないようです。#{hint}"
                    when NameError
                      available = WorldManager.registry.keys.join(', ')
                      "『#{e.name}』というオブジェクトは見つかりません。使えるオブジェクト: #{available}"
                    when RuntimeError
                      e.message
                    else
                      "#{e.class}: #{e.message}"
                    end

      {
        success: false,
        error: friendly_msg,
        error_type: e.class.name,
        events: Engine::EventRecorder.collect,
        objects: WorldManager.all_objects.map(&:state),
        instability: @instability
      }
    end
  end

  def self.reset_instability
    @instability = 0
  end

  def self.serialize_result(val)
    case val
    when GameObject then val.state
    when Array      then val.map { |v| v.is_a?(GameObject) ? v.state : v }
    when NilClass   then nil
    else val
    end
  end

  def self.suggest_methods(class_name, typo)
    klass = Object.const_get(class_name) rescue nil
    return [] unless klass
    all = klass.public_instance_methods(false).map(&:to_s)
    # Sort by Levenshtein-like character overlap
    all.min_by { |m| -(m.chars & (typo || '').chars).length }.then { |best|
      all.select { |m| m.start_with?((typo || '')[0..0] || '') }.first(3)
    }
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
