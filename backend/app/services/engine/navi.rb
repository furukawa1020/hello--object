module Engine
  class Navi
    DEFAULT_MESSAGE = "SYSTEM_WATCH: オブジェクトを選択し、その本質（class）をハックせよ。"

    def self.generate_message(world, last_result = nil, last_error = nil, selected_object = nil)
      instability = RubyEvaluator.instance_variable_get(:@instability) || 0

      # Priority 0: Critical Instability Warnings
      return "【警告】現実崩壊(REALITY_COLLAPSE)まで残り 10%。直ちにハックを中止するか、安定化させよ。" if instability > 90
      return "【注意】不整合波が増大中。インターフェースに異常が発生しています。" if instability > 70
      return "【微小振動】微細なグリッチを検知。コードの純度を高めなさい。" if instability > 40

      # Priority 1: Errors
      if last_error
        case last_error
        when /呪/, /cursed/
          return "【解析結果】その死滅関数（呪い）は通常層では解除不能。class 定義を直接書き換え、因果を再構築せよ。"
        when /NoMethodError/
          return "【無効命令】存在しないメソッドです。対象の schematic（設計図）を読み解き、真実を記述せよ。"
        when /SyntaxError/
          return "【構文エラー】論理構造が破綻しています。セミコロンや括弧の整合性を確認せよ。"
        else
          return "【例外検知】#{last_error.split(':').last.strip}。begin..rescue で捕捉可能か？"
        end
      end

      # Priority 2: World Objectives Advice
      current_scene = world.scene_metadata[world.current_scene_id.to_s]
      if current_scene && current_scene[:objectives]
        pending = current_scene[:objectives].find { |obj| !world.find_object(obj[:target])?.instance_variable_get(:@variables)[:completed] }
        return "【現優先目標】#{pending[:text]}。#{pending[:target]} を観測せよ。" if pending
      end

      # Priority 3: Selected Object context
      return generate_object_advice(selected_object) if selected_object

      # Priority 4: Victory
      return "【最終警告】真理の門が開いた。帰還の準備は整ったか。" if world.victory?
      
      DEFAULT_MESSAGE
    end

    private

    def self.generate_object_advice(obj)
      case obj.class.name
      when 'Door'
        obj.instance_variable_get(:@variables)[:locked] ? "【観測】閉鎖回路。unlock を定義、または呪いを排除せよ。" : "【観測】解放準備。open のトリガーを待機中。"
      when 'WeightPlate'
        "【観測】質量センサー。十分な weight を持つインスタンスを put() せよ。"
      when 'UnbreakableSafe'
        "【観測】絶対金庫。既存クラス(UnbreakableSafe)の再オープン、および unlock メソッドのオーバーライドが必要。"
      when 'GolemGatekeeper'
        "【観測】ダックタイピング門番。対象に dance メソッドを「実装」し、present() せよ。"
      when 'ForbiddenTome'
        "【警告】精神破壊パケット。begin..rescue 以外での接触は推奨されない。"
      when 'CoreMainframe'
        "【観測】中枢メインフレーム。method_missing による動的メソッド生成が攻略の鍵となる。"
      else
        "【解析】#{obj.name} (# {obj.class.name})。その instance_variables を変化させ、世界の整合性を保て。"
      end
    end
  end
end

