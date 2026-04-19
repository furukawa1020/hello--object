class RubyEvaluator
  @instability = 0

  def self.evaluate(code)
    begin
      Engine::EventRecorder.start_session
      
      # Metaprogramming Detection & High Risk Cost
      is_metaprog = code.match?(/class\s+|def\s+.*\.|\bdefine_method\b|\binstance_eval\b|\bmodule_eval\b/)
      
      if is_metaprog
        @instability += 15
        Engine::EventRecorder.record('glitch_minor', { text: 'REALITY_SKEW_DETECTED: Metaprogramming wave detected.' })
      else
        # Natural decay on clean executions
        @instability = [@instability - 1, 0].max if @instability > 0
      end

      # High Instability Hazards
      if @instability >= 100
        @instability = 0
        WorldManager.reset
        return {
          success: false,
          error: "FATAL: REALITY_COLLAPSE. System could not sustain the instability. Reality has been hard-reset to the last stable state.",
          instability: 0,
          objects: WorldManager.all_objects.map(&:state),
          events: [{ name: 'system_reset', meta: { icon: '☢️', text: 'REALITY_HARD_RESET', color: '#ff0000' } }]
        }
      end

      # Threshold Glitch Injection
      if @instability > 60
        Engine::EventRecorder.record('glitch_major', { text: 'WARNING: Interface coherence dropping.' }) if rand < 0.3
      elsif @instability > 30
        Engine::EventRecorder.record('glitch_minor', { text: 'System jitter detected.' }) if rand < 0.2
      end

      context = EvalContext.new(WorldManager.registry)
      result = context.instance_eval(code)

      events = Engine::EventRecorder.collect
      achievements = Engine::AchievementManager.analyze_execution(code, context)

      # Specific Stabilization Command Support
      if code.strip == 'system.stabilize!'
        @instability = [@instability - 30, 0].max
      end

      {
        success: true,
        result: serialize_result(result),
        formatted_result: format_result(result),
        result_type: result.class.name,
        result_color: color_for_type(result),
        code_analysis: analyze_code_pattern(code),
        events: events,
        achievements: achievements,
        objects: WorldManager.all_objects.map(&:state),
        scenes: WorldManager.world.scene_metadata.values,
        instability: @instability,
        is_victory: WorldManager.world.victory?,
        tutorial: WorldManager.world.tutorial_steps,
        navi_message: Engine::Navi.generate_message(WorldManager.world, result, nil)
      }
    rescue StandardError, ScriptError => e
      @instability += 5 # Errors are now more punishing
      @last_result = nil
      @last_error = e
      achievements = Engine::AchievementManager.analyze_execution(code, nil)
      
      # Trigger extra glitch on errors if unstable
      Engine::EventRecorder.record('glitch_error', { text: "CRYSTAL_FRACTURE: #{e.class}" }) if @instability > 40

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

  def self.format_result(val)
    case val
    when GameObject then "#<#{val.class.name} \"#{val.name}\">"
    when Array      then "[#{val.map { |v| v.respond_to?(:name) ? v.name : v.inspect }.join(', ')}]"
    when String     then val.include?("\n") ? val : val.inspect
    when NilClass   then "nil"
    else val.inspect
    end
  end

  def self.color_for_type(val)
    case val
    when TrueClass, FalseClass then '#ff993a'
    when Integer, Float        then '#60d0ff'
    when String                 then '#8aff80'
    when Array, Hash            then '#c8a0ff'
    else '#ffcc44'
    end
  end

  def self.analyze_code_pattern(code)
    return nil if code.blank?
    case code
    when /^\s*class\s+\w+.*def\s+\w+/ then { label: '🔓 クラス再定義', color: '#b060ff' }
    when /^\s*class\s+\w+/            then { label: '📐 クラス定義', color: '#c8a0ff' }
    when /^\s*def\s+\w+/              then { label: '🔧 メソッド定義', color: '#60d0ff' }
    when /\w+\.\w+\.\w+/               then { label: '⛓ メソッドチェーン', color: '#ffcc44' }
    when /\w+\.\w+/                    then { label: '📞 メソッド呼び出し', color: '#8aff80' }
    when /\w+\s*=\s*/                  then { label: '📦 変数への代入', color: '#ffb86c' }
    else { label: '🔢 式', color: '#88ccff' }
    end
  end
end
