module Engine
  class Navi
    DEFAULT_MESSAGE = "システム稼働中… オブジェクトを選択し、その構造を記述しなさい。"

    def self.generate_message(world, last_result = nil, last_error = nil, selected_object = nil)
      # Priority 1: Errors
      if last_error
        return "その呪縛（呪い）は通常の干渉を拒絶しています。クラスの定義そのものを書き換え、因果をねじ曲げなさい。" if last_error.include?("呪") || last_error.include?("cursed")
        return "存在しないメソッドを呼ぼうとしています。Actions パネルを参考に、正しい命令を与えてください。" if last_error.include?("NoMethodError")
        return "論理に乱れがあります。提供されたコードの構文を確認しなさい。" if last_error.include?("SyntaxError")
        return "エラーが発生しました: #{last_error.split(':').last.strip}"
      end

      # Priority 2: Selected Object context
      if selected_object
        return generate_object_advice(selected_object)
      end

      # Priority 3: World events or progression
      return generate_progression_advice(world)
    end

    private

    def self.generate_object_advice(obj)
      case obj.class.name
      when 'Door'
        return "古き扉に鍵がかかっています。`door.unlock` を試すか、呪われている場合はその定義を破壊しなさい。" if obj.instance_variable_get(:@locked)
        "扉が開かれようとしています。`door.open` と唱えなさい。"
      when 'Chest'
        return "堅牢なチェストです。中身を得るには適切な鍵が必要です。" if obj.instance_variable_get(:@locked)
        "中身はあなたの手の中にあります。"
      when 'Tome'
        return "知識の集積体です。`tome.read` で世界の法則を学びなさい。" unless obj.instance_variable_get(:@read)
        "その古文書からは、すでに全ての英知を吸収しました。"
      when 'Npc'
        "高位の存在です。`talk` で対話し、`ask` で特定のトピックについて質問が可能です。"
      when 'Mirror'
        "反映の鏡です。`mirror.reflect(object)` で他者の構造を写し出すことができます。"
      when 'Pedestal'
        "捧げ物の台座です。`place(item)` で儀式を行い、封印を解きなさい。"
      when 'WorldGate'
        "次元の門です。整合性が保たれていれば、認証の末に道が開けるでしょう。"
      when 'Glitch'
        "システムの不整合です。通常の手段では干渉できません。メタプログラミングによる動的な修正が必要です。"
      else
        "#{obj.name} を観測しています。その内部変数（@variables）に変化を与えなさい。"
      end
    end

    def self.generate_progression_advice(world)
      return "全ての試練を乗り越え、真理の門を開く時が来ました。" if world.victory?
      DEFAULT_MESSAGE
    end
  end
end
