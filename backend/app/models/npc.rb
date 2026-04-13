# NPC — 話しかけると世界の情報を教えてくれる存在。Phase 13 で会話分岐に対応。
class Npc < GameObject
  def initialize(id:, name:, description:, lines: [], branches: {})
    super(id: id, name: name, description: description)
    @default_lines = lines.empty? ? fetch_default_lines : lines
    @branches      = branches      # { 'topic' => { lines: [...], next_state: '...' } }
    @talked_count  = 0
    @current_state = 'start'
  end

  def ui_actions
    a = WorldManager::ALIASES.key(@id) || @id
    [
      { label: '💬 話しかける',            code: "#{a}.talk" },
      { label: '❓ 呪いについて聞く',       code: "#{a}.ask('cursed')" },
      { label: '❓ クラスについて聞く',     code: "#{a}.ask('class')" },
      { label: '🤝 答える (yes/no等)',     code: "#{a}.respond('yes')" },
      { label: '🔮 鏡で反射する',          code: "mirror.reflect(#{a})" },
    ]
  end

  def ui_schematic
    <<~RUBY
      class Npc < GameObject
        def talk
          # セリフを順番に返す
          @lines[@talked_count % @lines.length]
        end

        def ask(topic)
          # トピックに応じた回答を返す
          responses[topic]
        end
      end
    RUBY
  end

  def ui_sprite
    classes = ['npc-sprite']
    classes << 'has-talked' if @talked_count > 0
    dot = @talked_count > 0 ? "<div class='npc-speech-dot'></div>" : ""
    
    "<div class='#{classes.join(' ')}'>
      <div class='npc-eye'></div>
      #{dot}
    </div>"
  end

  def completed?
    @talked_count > 0
  end

  def talk
    @talked_count += 1
    emit('npc_talked', { npc_id: @id })

    if @branches[@current_state]
      lines = @branches[@current_state][:lines]
      line  = lines[@talked_count % lines.length]
      
      # Auto-transition if defined
      if @branches[@current_state][:auto_next]
        @current_state = @branches[@current_state][:auto_next]
        @talked_count = 0
      end
      line
    else
      @default_lines[@talked_count % @default_lines.length]
    end
  end

  def respond(choice)
    choice = choice.to_s.downcase
    if @branches[choice]
      @current_state = choice
      @talked_count = 0
      emit('npc_talked', { npc_id: @id, choice: choice })
      @branches[choice][:lines].first
    else
      "「#{choice}」については、私にはよくわかりません。"
    end
  end

  def ask(topic)
    responses = {
      "class"   => "クラスとは、オブジェクトの設計図のようなものです。`door.class` と唱えてみてください。",
      "method"  => "メソッドとは、オブジェクトへの命令のことです。`door.methods` で一覧を見られます。",
      "cursed"  => "あの扉の呪いは、クラスの奥深くに刻まれています。定義を書き換えれば、解けるでしょう。",
      "open"    => "扉は、鍵があれば開きます。ただし…呪われていれば、別の手段が必要です。"
    }
    responses[topic.to_s.downcase] || "「#{topic}」については知りません。`respond('choice')` で私に答えを示してください。"
  end

  private

  def fetch_default_lines
    [
      "この部屋に来た者は少ない。あなたはコードを唱えて先へ進もうとしているのですか？",
      "どのオブジェクトも、その内側に変数を持っています。`inspect` で覗いてみるといいでしょう。",
      "`ask('cursed')` と話しかけなさい。あの扉のことを教えましょう。"
    ]
  end
end
