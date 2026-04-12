class Chest < GameObject
  include Container

  def initialize(id:, name:, description:)
    super
    initialize_container
    @locked = true
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
