class MindShatterError < StandardError; end

class ForbiddenTome < GameObject
  def initialize(id:, name: '禁断の魔導書', description: '禍々しいオーラを放つ本。普通に「読む（read）」と精神が破壊される。例外処理（rescue）が必要だ。')
    super(id: id, name: name, description: description)
    @variables[:knowledge_extracted] = false
  end

  def read
    engine.record_event('error', "禁断の知識が脳に直接流れ込んできた！致命的なエラー発生！", object_id: id, color: '#ff4444')
    raise MindShatterError, "【秘密のパスワード】: 'RUBY_SOVEREIGN_OVERRIDE'"
  end

  def extract
    begin
      read
    rescue MindShatterError => e
      @variables[:knowledge_extracted] = true
      engine.record_event('success', "例外処理でデータの抽出に成功した！", object_id: id, color: '#9b0eff')
      "抽出成功: #{e.message}"
    end
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: '例外処理（begin...rescue）の試練。',
        warning: '直接読むと例外発生！rescue で安全に読め！'
      },
      labels: [
        { icon: '📖', text: 'Forbidden Tome', level: 4 },
        { icon: '💀', text: 'Dangerous', level: 1 }
      ],
      actions: [
        { label: 'Read (Dangerous!)', code: "#{id}.read", disabled: false },
        { label: 'Safe Extract', code: "begin\n  #{id}.read\nrescue => e\n  e.message\nend", disabled: false }
      ],
      completed: @variables[:knowledge_extracted]
    )
  end

  def schematic
    <<~RUBY
      class MindShatterError < StandardError; end

      class ForbiddenTome < GameObject
        def read
          # この例外を rescue で補足し、
          # エラーメッセージの中身(e.message)を取り出せ！
          raise MindShatterError, "[SECRET_DATA]"
        end
      end

      # 正しい使い方:
      begin
        tome.read
      rescue MindShatterError => e
        e.message  # => "[SECRET_DATA]"
      end
    RUBY
  end
end
