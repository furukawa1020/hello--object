class WeightPlate < GameObject
  def initialize(id:, name: '古代の感圧板', description: '重厚な石で作られた感圧板。上に何か重いものを乗せる必要がありそうだ。')
    super(id: id, name: name, description: description)
    @variables[:activated] = false
    @variables[:current_object_id] = nil
  end

  def put(target_object)
    if target_object.nil?
      raise "対象のオブジェクトを指定してください。例: weight_plate.put(chest)"
    end

    unless target_object.is_a?(GameObject)
      raise "乗せられるのはゲーム内のオブジェクト（GameObject）だけだ。"
    end

    # Check for weight property, defaulting to 0 if not present
    target_weight = 0
    if target_object.respond_to?(:weight)
      target_weight = target_object.weight
    elsif target_object.instance_variable_defined?(:@weight)
      target_weight = target_object.instance_variable_get(:@weight)
    end

    if target_weight >= 100
      @variables[:activated] = true
      @variables[:current_object_id] = target_object.id
      engine.record_event('interaction', "巨大な感圧板が沈み込み、どこかでカチリと音がした。", object_id: id, color: '#3aff8a')
      "【成功】#{target_object.name}の重みで感圧板が起動した！"
    else
      @variables[:activated] = false
      @variables[:current_object_id] = target_object.id
      engine.record_event('interaction', "感圧板に乗せたが、軽すぎて反応しない。", object_id: id, color: '#ff4444')
      "#{target_object.name}では軽すぎるようだ。重さ(@weight)が 100 以上のオブジェクトが必要だ。"
    end
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: '対象を乗せることで起動する装置。',
        warning: @variables[:activated] ? '起動中' : '非アクティブ'
      },
      labels: [
        { icon: '⚖️', text: 'Weight Sensor', level: 1 },
        { icon: '⚙️', text: @variables[:activated] ? 'Active' : 'Dormant', level: @variables[:activated] ? 2 : 1 }
      ],
      actions: [
        { label: 'Put Object', code: "weight_plate.put(chest)", disabled: false }
      ]
    )
  end

  def schematic
    <<~RUBY
      class WeightPlate < GameObject
        def put(target_object)
          weight = target_object.instance_variable_get(:@weight) || 0
          if weight >= 100
            @activated = true
          else
            "Too light..."
          end
        end
      end
    RUBY
  end
end
