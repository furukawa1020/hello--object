class CoreMainframe < GameObject
  def initialize(id:, name: '中枢メインフレーム', description: 'auth_001 から auth_050 までの50個のメソッドに全て true で応答するオブジェクトが必要。method_missing を使え。')
    super(id: id, name: name, description: description)
    @variables[:hacked] = false
  end

  def unlock_with(key_object)
    if key_object.nil?
      raise "認証に使用するオブジェクト（鍵）を指定してください。 例: #{id}.unlock_with(key)"
    end

    (1..50).each do |i|
      method_name = "auth_#{format('%03d', i)}".to_sym

      unless key_object.respond_to?(method_name)
        engine.record_event('error', "認証失敗: メソッド #{method_name} が見つかりません。", object_id: id, color: '#ff4444')
        return "アクセス拒否: キーオブジェクトは #{method_name} に応答できません。"
      end

      result = key_object.send(method_name)
      unless result == true
        engine.record_event('error', "認証失敗: #{method_name} が true を返しませんでした（got: #{result.inspect}）。", object_id: id, color: '#ff4444')
        return "アクセス拒否: #{method_name} の戻り値が不正です。"
      end
    end

    @variables[:hacked] = true
    engine.record_event('success', "全自動認証突破！メインフレームの制御を奪取しました。", object_id: id, color: '#9b0eff')
    "【完全突破】SYSTEM COMPROMISED. Welcome, Root User."
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: 'メタプログラミング（method_missing）の試練。',
        warning: @variables[:hacked] ? '制御奪取済' : '厳重警戒中'
      },
      labels: [
        { icon: '💻', text: 'Mainframe', level: 5 },
        { icon: '🔒', text: @variables[:hacked] ? 'COMPROMISED' : 'Secure', level: @variables[:hacked] ? 3 : 2 }
      ],
      actions: [
        { label: 'Attempt Hack', code: "#{id}.unlock_with(key_001)", disabled: @variables[:hacked] },
        { label: 'Hint: method_missing', code: <<~CODE.strip, disabled: false }
          class Key
            def method_missing(m, *args)
              m.to_s.start_with?('auth_') ? true : super
            end
            def respond_to_missing?(m, include_private = false)
              m.to_s.start_with?('auth_') || super
            end
          end
          #{id}.unlock_with(key_001)
        CODE
      ],
      completed: @variables[:hacked]
    )
  end

  def schematic
    <<~RUBY
      class CoreMainframe < GameObject
        def unlock_with(key_object)
          # auth_001 から auth_050 までのメソッドをすべて呼び出し、
          # 全てが true を返せばロック解除となる。
          (1..50).each do |i|
            m = "auth_\#{format('%03d', i)}"
            unless key_object.respond_to?(m) && key_object.send(m) == true
              return "Access Denied"
            end
          end
          @hacked = true
        end
      end

      # ヒント: 50個メソッドを手動定義するのは無謀だ！
      # method_missing と respond_to_missing? を使って
      # auth_ で始まるメソッドすべてに true を返せ。
      class Key
        def method_missing(m, *args)
          m.to_s.start_with?('auth_') ? true : super
        end
        def respond_to_missing?(m, include_private = false)
          m.to_s.start_with?('auth_') || super
        end
      end
    RUBY
  end
end
