class Key < GameObject
  def ui_sprite
    "<div class='key-sprite'>
      <div class='key-loop'></div>
      <div class='key-shaft'></div>
      <div class='key-teeth'></div>
    </div>"
  end

  def completed?
    false
  end

  def initialize(id:, name:, description:)
    super
  end
end
