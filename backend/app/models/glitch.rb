# Glitch — システムの不整合（バグ）が実体化した存在。
# 通常のメソッド呼び出しを method_missing で無効化し、メタプログラミングによる介入を要求する。
class Glitch < GameObject
  def initialize(id:, name:, description:)
    super(id: id, name: name, description: description)
    @integrity = 100
    @active = true
    @authorized = false
  end

  def ui_actions
    a = 'glitch'
    [
      { label: '💬 話しかける',  code: "#{a}.talk" },
      { label: '🛠 修正する',     code: "#{a}.neutralize!" },
    ]
  end

  def ui_schematic
    <<~RUBY
      class Glitch < GameObject
        def method_missing(m, *args)
          if @active
            raise "Glitch resists!"
          end
        end

        def neutralize!
          @active = false
        end
      end
    RUBY
  end

  # method_missing を使って、特定のメソッド以外をすべて弾く（ノイズを返す）
  def method_missing(m, *args, &block)
    if @active
      emit('glitch_noise', { method: m })
      raise "SYSTEM ERROR: メソッド `#{m}` は無効化されています。不整合な存在（Glitch）がシステムを汚染しています。"
    else
      super
    end
  end

  def respond_to_missing?(method_name, include_private = false)
    !@active || super
  end

  # 特異メソッド（Singleton Method）を定義されることで「修正」される
  def neutralize!
    @active = false
    @integrity = 0
    "不整合が解消されました。Glitch は沈黙しました。"
  end

  def talk
    if @active
      "…01001000 01000101 01001100 01010000… (このオブジェクトは正常な対話を受け付けない)"
    else
      "かつて私はバグだった。今はただの静かなオブジェクトです。"
    end
  end

  def state
    s = super
    s[:variables][:active] = @active
    s[:variables][:integrity] = @integrity
    s[:variables][:authorized] = @authorized
    s
  end
end
