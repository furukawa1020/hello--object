class GolemGatekeeper < GameObject
  def initialize(id:, name: '古代のゴーレム', description: '無機質だが、なぜか陽気なエネルギーを感じる魔法の門番。「踊れる者」しか通さないようだ。')
    super(id: id, name: name, description: description)
    @variables[:satisfied] = false
  end

  def present(object)
    if object.nil?
      raise "見せるべきオブジェクトを指定してくれ。 例: #{id}.present(chest)"
    end

    if object.respond_to?(:dance)
      @variables[:satisfied] = true
      engine.record_event('success', "ゴーレムは #{object.name} の素晴らしいダンスを見て大満足した！道を譲ってくれるようだ。", object_id: id, color: '#3aff8a')
      "【突破】ゴーレムは満足し、道を大きく開けた。"
    else
      engine.record_event('error', "#{object.name} は全く踊れない。ゴーレムは退屈そうにしている。", object_id: id, color: '#ff4444')
      %[ゴーレム「つまらん！『dance』のメソッドを持たないオブジェクトは認めん！」\n\n# ヒント: 特異メソッドをオブジェクトに追加しよう:\ndef #{object.id}.dance\n  "Dancing!"\nend\n#{id}.present(#{object.id})]
    end
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: 'ダックタイピング（振る舞いによる型判定）の試練。',
        warning: @variables[:satisfied] ? '満足している' : '退屈している'
      },
      labels: [
        { icon: '🗿', text: 'Golem Guard', level: 3 },
        { icon: '🎵', text: @variables[:satisfied] ? 'Happy' : 'Bored', level: @variables[:satisfied] ? 2 : 1 }
      ],
      actions: [
        { label: 'Present Object', code: "#{id}.present(chest_001)", disabled: @variables[:satisfied] },
        { label: 'Hint: Add dance', code: "def chest_001.dance\n  'Dancing!'\nend\n#{id}.present(chest_001)", disabled: false }
      ],
      completed: @variables[:satisfied]
    )
  end

  def schematic
    <<~RUBY
      class GolemGatekeeper < GameObject
        def present(object)
          # オブジェクトの種類（クラス）は問わない。
          # 'dance' というメソッドさえ持っていれば合格！
          if object.respond_to?(:dance)
            @variables[:satisfied] = true
          else
            "Bored..."
          end
        end
      end
    RUBY
  end
end
