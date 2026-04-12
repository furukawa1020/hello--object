# Pedestal — 台座。アイテムを置くことでアクションが発生する仕掛け
class Pedestal < GameObject
  def initialize(id:, name:, description:, accepts: nil, reward_message: nil)
    super(id: id, name: name, description: description)
    @accepts     = accepts        # どのクラス名を受け付けるか (e.g., "Key")
    @reward_message = reward_message
    @activated   = false
    @holding     = nil
  end

  def place(item)
    if @activated
      "台座はすでに起動している。"
    elsif @accepts && !item.is_a?(Object.const_get(@accepts) rescue Object)
      "この台座には #{@accepts} クラスのオブジェクトしか置けないようだ。"
    elsif item.is_a?(GameObject)
      @holding  = item.id
      @activated = true
      emit('pedestal_activated', { item_id: item.id })
      @reward_message || "#{item.name} を台座に置くと、何かが起動した…！"
    else
      "それは置けないようだ。"
    end
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
end
