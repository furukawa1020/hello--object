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
