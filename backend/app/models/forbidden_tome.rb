class MindShatterError < StandardError; end

class ForbiddenTome < GameObject
  def initialize(id, name: '禁断の魔導書', description: '禍々しいオーラを放つ本。普通に「読む（read）」と精神が破壊（クラッシュ）されてしまう。例外処理が必要だろう。')
    super(id, name: name, description: description)
    @variables[:knowledge_extracted] = false
  end

  def read
    engine.record_event('error', "禁断の知識が脳に直接流れ込んできた！致命的なエラー発生！", object_id: id, color: '#ff4444')
    raise MindShatterError, "【秘密のパスワード】: 'RUBY_SOVEREIGN_OVERRIDE'"
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: '例外処理（begin...rescue）の試練。',
        warning: '直接読むと例外発生！'
      },
      labels: [
        { icon: '📖', text: 'Forbidden Magic', level: 4 },
        { icon: '💀', text: 'Dangerous', level: 1 }
      ],
      actions: [
        { label: 'Read (Dangerous)', code: "#{id}.read", disabled: false },
        { label: 'Safe Extraction', code: "begin\n  #{id}.read\nrescue => e\n  e.message\nend", disabled: false }
      ],
      completed: false
    )
  end

  def schematic
    <<~RUBY
      class MindShatterError < StandardError; end

      class ForbiddenTome < GameObject
        def read
          # この例外を補足（rescue）し、
          # エラーメッセージの中身（e.message）を取り出せ！
          raise MindShatterError, "[SECRET_DATA]"
        end
      end
    RUBY
  end
end
