# Mirror — オブジェクトや値を反映する特殊なオブジェクト
# reflect(obj) で任意のオブジェクトの状態を見せる教育ツール
class Mirror < GameObject
  def initialize(id:, name:, description:)
    super
    @reflecting = nil
    @reflection_count = 0
  end

  def reflect(target = nil)
    if target.nil?
      @reflecting = nil
      "鏡が曇り、なにも映さなくなった。"
    elsif target.is_a?(GameObject)
      @reflecting = target.id
      @reflection_count += 1
      emit('mirror_reflected', { target_id: target.id })
      <<~REFLECTION
        【#{target.name}（#{target.class.name}）】を映した。
        
        クラス: #{target.class}
        使えるメソッド: #{target.class.public_instance_methods(false).map { |m| ".#{m}" }.join(', ')}
        内部変数: #{target.instance_variables.reject { |v| [:@id, :@name, :@description].include?(v) }.map { |v| "#{v}=#{target.instance_variable_get(v).inspect}" }.join(', ')}
      REFLECTION
    else
      @reflection_count += 1
      <<~REFLECTION
        【#{target.inspect}（#{target.class.name}）】を映した。
        
        クラス: #{target.class}
        使えるメソッド: #{target.class.public_instance_methods(false).first(8).map { |m| ".#{m}" }.join(', ')} ...
        オブジェクトID: #{target.object_id}
      REFLECTION
    end
  end

  def gaze
    if @reflecting
      "鏡には「#{@reflecting}」が映っている。これまでに#{@reflection_count}回の反射を行った。"
    else
      "鏡は空白だ。`mirror.reflect(オブジェクト)` で何かを映してみよう。"
    end
  end
end
