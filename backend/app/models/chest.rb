class Chest < GameObject
  include Container

  def initialize(id:, name:, description:)
    super
    initialize_container
    @locked = true
  end

  def ui_actions
    a = WorldManager::ALIASES.key(@id) || @id
    [
      { label: '🗝 鍵を使って開ける', code: "#{a}.unlock(key)" },
      { label: '📦 中を覗く',        code: "#{a}.open" },
    ]
  end

  def ui_schematic
    <<~RUBY
      class Chest < GameObject
        include Container

        def unlock(key_obj)
          if key_obj.is_a?(Key)
            @locked = false
          end
        end
      end
    RUBY
  end

  def ui_labels
    labels = []
    labels << { icon: '🔒', text: '鍵がかかっています', level: 'warning' } if @locked
    labels << { icon: '🔓', text: '鍵は開いています', level: 'ok' } if !@locked
    if @items.any?
      labels << { icon: '📦', text: "中身: #{@items.map(&:name).join(', ')}", level: 'neutral' }
    end
    labels
  end

  def ui_sprite
    classes = ['chest-sprite']
    classes << (@locked ? 'is-locked' : 'is-unlocked')
    
    lid = !@locked ? "<div class='chest-open-lid'></div>" : ""
    
    "<div class='#{classes.join(' ')}'>
      <div class='chest-latch'></div>
      #{lid}
    </div>"
  end

  def completed?
    !@locked
  end

  def unlock(key_obj = nil)
    if key_obj.is_a?(Key)
      @locked = false
      emit('chest_unlocked')
      "#{key_obj.name}を使ってチェストを開けました。"
    else
      "鍵が合わないか、鍵を持っていません。"
    end
  end

  def open
    if @locked
      raise "鍵がかかっています。"
    end
    emit('chest_opened')
    "チェストを開けました。中には #{@items.map(&:name).join(', ')} が入っています。"
  end

  def locked?
    @locked
  end
end
