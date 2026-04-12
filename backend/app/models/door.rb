class Door < GameObject
  def initialize(id:, name:, description:, locked: true)
    super(id: id, name: name, description: description)
    @locked = locked
    @open = false
  end

  def unlock
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
