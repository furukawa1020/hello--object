# Pedestal — 台座。正しいアイテムを置くと隠されたオブジェクトが解放される
class Pedestal < GameObject
  def initialize(id:, name:, description:, accepts: nil, reveals: nil, reward_message: nil)
    super(id: id, name: name, description: description)
    @accepts     = accepts
    @reveals     = reveals     # object id to reveal in the world
    @reward_message = reward_message
    @activated   = false
    @holding     = nil
  end

  def ui_actions
    a = WorldManager::ALIASES.key(@id) || @id
    [
      { label: '🗝 鍵を置く',     code: "#{a}.place(key)" },
      { label: '↩ アイテムを外す', code: "#{a}.remove" },
    ]
  end

  def ui_schematic
    <<~RUBY
      class Pedestal < GameObject
        def place(item)
          if item.is_a?(Key)
            @activated = true
          end
        end

        def remove
          @activated = false
        end
      end
    RUBY
  end

  def ui_labels
    labels = []
    labels << { icon: '⚡', text: '台座が起動中！', level: 'ok' } if @activated
    labels << { icon: '📦', text: "配置: #{@holding}", level: 'neutral' } if @holding
    labels
  end

  def place(item)
    if @activated
      return "台座はすでに起動している。もう一度試す前に remove で取り外しなさい。"
    end

    unless item.is_a?(GameObject)
      return "それは台座に置けないようだ。"
    end

    if @accepts
      klass = Object.const_get(@accepts) rescue nil
      unless klass && item.is_a?(klass)
        return "この台座には #{@accepts} クラスのオブジェクトしか置けないようだ。"\
               "（#{item.class.name} は受け付けない）"
      end
    end

    @holding   = item.id
    @activated = true
    emit('pedestal_activated', { item_id: item.id })

    # Reveal a hidden object if configured
    revealed_msg = ""
    if @reveals
      obj = Engine::EventRecorder.world&.reveal_object(@reveals)
      if obj
        revealed_msg = "\n\n✨ 台座の光が部屋を照らした…！封印されていた「#{obj.name}」が姿を現した！"
      end
    end

    (@reward_message || "#{item.name} を台座に置くと、なにかが起動した…！") + revealed_msg
  end

  def remove
    if @activated && @holding
      @activated = false
      held = @holding
      @holding = nil
      "#{held} を台座から取り外した。台座は非活性化した。"
    else
      "台座には何も置かれていない。"
    end
  end

  def inspect_state
    if @activated
      "台座は起動中。#{@holding}が置かれている。"
    elsif @holds
      "台座にはなにかが置かれている。"
    else
      "台座は空だ。#{@accepts ? "#{@accepts}クラスのオブジェクトを置けそうだ。" : ''}"
    end
  end
end
