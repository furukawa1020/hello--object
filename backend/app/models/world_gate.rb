# WorldGate — 最後の試練。システム全体をパッチすることで開く
class WorldGate < GameObject
  def initialize(id:, name:, description:)
    super(id: id, name: name, description: description)
    @integrity = 100
    @open = false
    @authorized = false
  end

  def ui_actions
    a = 'gate'
    [
      { label: '🔑 認証する',     code: "#{a}.authorize('ADMIN_ACCESS')" },
      { label: '🚪 門を開く',     code: "#{a}.open" },
    ]
  end

  def ui_schematic
    <<~RUBY
      class WorldGate < GameObject
        def authorize(key)
          @authorized = (key == "ADMIN_ACCESS")
        end

        def open
          if @authorized && @integrity <= 0
            @open = true
          end
        end
      end
    RUBY
  end

  def authorize(key = nil)
    if key == "ADMIN_ACCESS"
      @authorized = true
      "認証に成功しました。アクセス権限が付与されました。"
    else
      raise "認証エラー: 権限が不足しています。システム管理者のアクセスが必要です。"
    end
  end

  def open
    unless @authorized
      raise "セキュリティ・アラート: 未認証のアクセス。ゲートは固く閉ざされています。"
    end
    
    if @integrity > 0
      raise "システム整合性エラー: 整合性（@integrity）が #{@integrity}% 残っています。システムを脆弱化（0%）させる必要があります。"
    end

    @open = true
    emit('door_opened')
    "【おめでとう！】世界の門が開かれました。あなたは Ruby の真理に到達しました。"
  end

  def inspect_state
    "整合性: #{@integrity}%, 認証: #{@authorized ? '済' : '未'}"
  end
end
