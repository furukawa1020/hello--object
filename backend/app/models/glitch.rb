# Glitch — ラスボスオブジェクト。あらゆるメソッド呼び出しを「拒絶」し、世界の崩壊を演出する
class Glitch < GameObject
  def initialize(id:, name:, description:)
    super(id: id, name: name, description: description)
    @shielded = true
    @instability = 10
  end

  # Standard methods are ignored or mocked
  def method_missing(m, *args, &block)
    emit('glitch_event', { level: 20 })
    [
      "Glitch: そのような命令は受理されません。",
      "Glitch: システムは私の支配下にあります。",
      "Glitch: 無駄な抵抗はやめなさい。",
      "Glitch: #{@name} はあなたの言葉を理解しません。"
    ].sample
  end

  def respond_to_missing?(method_name, include_private = false)
    true
  end

  def talk
    "Glitch: 私に語りかけることはできません。私はシステムそのものの断片なのですから。"
  end

  # The only way to win: metaprogram the neutralizing method OR patch integrity
  def neutralize
    if @shielded
      emit('glitch_event', { level: 50 })
      raise "Glitch: シールドが有効です。外部からの書き換えは拒絶されます。"
    end
    @instability = 0
    "Glitch: …システムに干渉されました。私の存在維持が…不可能です。"
  end

  def inspect_state
    "シールド: #{@shielded ? '有効' : '無効'}, 不安定度: #{@instability}"
  end
end
