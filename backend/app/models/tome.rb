# 古文書（Tome）— 読み込むことで世界の知識を得られる
class Tome < GameObject
  def initialize(id:, name:, description:)
    super
    @read = false
    @knowledge = []
  end

  def read
    @read = true
    emit('tome_opened')
    lines = knowledge_lines
    @knowledge = lines
    "古文書を読み解いた。\n#{lines.join("\n")}"
  end

  def tip
    knowledge_lines.sample || "何も書いていない。"
  end

  private

  def knowledge_lines
    [
      "すべてのオブジェクトはクラスのインスタンスである。",
      "クラスは実行中に再定義（再オープン）できる。",
      "`class Door; def unlock; ... end; end` と唱えれば、扉の法則を書き換えられる。",
      "メソッドが呼ばれる先は、そのオブジェクトのクラスである。",
      "呪われたオブジェクトの呪いは、クラス定義の中に埋め込まれている。"
    ]
  end
end
