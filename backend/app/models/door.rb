class Door < GameObject
  def initialize(id:, name:, description:, locked: true, cursed: false)
    super(id: id, name: name, description: description)
    @locked = locked
    @open = false
    @cursed = cursed
  end

  def ui_actions
    a = WorldManager::ALIASES.key(@id) || @id
    [
      { label: `🔓 鍵を開ける`,  code: "#{a}.unlock",  disabled: !@locked },
      { label: `🚪 扉を開く`,    code: "#{a}.open",    disabled: @locked },
      { label: `🔒 鍵をかける`,  code: "#{a}.lock",    disabled: @locked },
      { label: `🚪 扉を閉める`,  code: "#{a}.close",   disabled: !@open },
    ]
  end

  def ui_labels
    labels = []
    labels << { icon: '⛧', text: '強力な呪いがかかっています', level: 'danger' } if @cursed
    labels << { icon: '🔒', text: '鍵がかかっています', level: 'warning' } if @locked
    labels << { icon: '🔓', text: '鍵は開いています', level: 'ok' } if !@locked
    labels << { icon: '🚪', text: @open ? '扉が開いています' : '扉は閉じています', level: @open ? 'ok' : 'neutral' }
    labels
  end

  def ui_sprite
    classes = ['door-sprite']
    classes << 'is-open' if @open
    classes << 'is-locked' if @locked
    classes << 'is-cursed' if @cursed
    
    glyph = @cursed ? "<div class='curse-glyph'>⛧</div>" : ""
    glow  = @open ? "<div class='door-open-glow'></div>" : ""
    indicator = (!@locked && !@cursed && !@open) ? "<div class='door-unlocked-indicator'></div>" : ""

    "<div class='#{classes.join(' ')}'>
      <div class='door-knob'></div>
      #{glyph}
      #{indicator}
      #{glow}
    </div>"
  end

  def completed?
    @open
  end

  def ui_schematic
    <<~RUBY
      class Door < GameObject
        def unlock
          if @cursed
            raise "呪われた扉は開けられない"
          end
          @locked = false
        end

        def open
          if @cursed || @locked
            raise "開かない"
          end
          @open = true
        end
      end
    RUBY
  end

  def unlock
    if @cursed
      raise "扉には強力な呪印が刻まれており、いかなる鍵も受け付けません。物理的な仕組みを超越した力が必要です。"
    end
    @locked = false
    emit('door_unlocked')
    "カチャリと音がして、ドアの鍵が開きました。"
  end

  def lock
    @locked = true
    emit('door_locked')
    "ドアに鍵をかけました。"
  end

  def open
    if @cursed
      raise "呪われた扉は、あなたの意思を拒絶するようにびくともしません。"
    end
    if @locked
      raise "鍵がかかっていて開きません。"
    end
    @open = true
    emit('door_opened')
    "ドアがゆっくりと開きました。"
  end

  def close
    @open = false
    "ドアを閉めました。"
  end

  def locked?
    @locked
  end

  def open?
    @open
  end
end
