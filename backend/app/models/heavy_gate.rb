class HeavyGate < GameObject
  def initialize(id:, plate_id:, name: '重力式防壁', description: '分厚い鋼鉄のゲート。隣接するシステムにロックされているようだ。')
    super(id: id, name: name, description: description)
    @variables[:open] = false
    @variables[:plate_id] = plate_id.to_s
  end

  def open
    plate = engine.world.find_object(@variables[:plate_id])

    if plate && plate.variables[:activated]
      @variables[:open] = true
      engine.record_event('success', "防壁が重々しい音を立てて開いた。", object_id: id, color: '#3aff8a')
      "【突破】セキュリティ防壁が解除された。"
    else
      engine.record_event('error', "アクセス拒否。接続先の感圧板がアクティブではない。", object_id: id, color: '#ff4444')
      "開かない。連動している装置（#{@variables[:plate_id]}）を先に起動する必要がある。"
    end
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: '外部からのステータス入力に依存するゲート。',
        warning: @variables[:open] ? 'セキュリティ解除済' : 'ロック状態'
      },
      labels: [
        { icon: '🚪', text: 'Heavy Gate', level: 2 },
        { icon: '🔒', text: @variables[:open] ? 'Open' : 'Locked', level: @variables[:open] ? 2 : 1 }
      ],
      actions: [
        { label: 'Attempt Open', code: "#{id}.open", disabled: @variables[:open] }
      ],
      completed: @variables[:open]
    )
  end

  def schematic
    <<~RUBY
      class HeavyGate < GameObject
        def open
          plate = engine.world.find_object(@plate_id)
          if plate && plate.variables[:activated]
            @variables[:open] = true
            "Unlocked!"
          else
            "Access Denied"
          end
        end
      end
    RUBY
  end
end
