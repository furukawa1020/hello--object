# NPC — 話しかけると世界の情報を教えてくれる存在
class Npc < GameObject
  def initialize(id:, name:, description:, lines: [])
    super(id: id, name: name, description: description)
    @lines = lines.empty? ? default_lines : lines
    @talked_count = 0
    @mood = "neutral"
  end

  def talk
    line = @lines[@talked_count % @lines.length]
    @talked_count += 1
    emit('npc_talked', { npc_id: @id })
    line
  end

  def ask(topic)
    responses = {
      "class"   => "クラスとは、オブジェクトの設計図のようなものです。`door.class` と唱えてみてください。",
      "method"  => "メソッドとは、オブジェクトへの命令のことです。`door.methods` で一覧を見られます。",
      "cursed"  => "あの扉の呪いは、クラスの奥深くに刻まれています。定義を書き換えれば、解けるでしょう。",
      "open"    => "扉は、鍵があれば開きます。ただし…呪われていれば、別の手段が必要です。"
    }
    responses[topic.to_s.downcase] || "「#{topic}」については知りません。"
  end

  def mood
    "私の気分は #{@mood} です。"
  end

  private

  def default_lines
    [
      "この部屋に来た者は少ない。あなたはコードを唱えて先へ進もうとしているのですか？",
      "どのオブジェクトも、その内側に変数を持っています。`inspect` で覗いてみるといいでしょう。",
      "`ask('cursed')` と話しかけなさい。あの扉のことを教えましょう。",
      "Rubyでは、すべてがオブジェクトです。数字でさえ。`1.class` を試してみては？"
    ]
  end
end
