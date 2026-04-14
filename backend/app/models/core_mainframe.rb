class CoreMainframe < GameObject
  def initialize(id, name: '中枢メインフレーム', description: '厳重なセキュリティで保護されたシステムコア。認証用オブジェクトは auth_001 から auth_050 までの50個のメソッドに全て true で応答しなければならない。')
    super(id, name: name, description: description)
    @variables[:hacked] = false
  end

  def unlock_with(key_object)
    if key_object.nil?
      raise "認証に使用するオブジェクト（鍵）を指定してください。"
    end

    (1..50).each do |i|
      method_name = "auth_#{format('%03d', i)}".to_sym
      
      unless key_object.respond_to?(method_name)
        engine.record_event('error', "認証失敗: メソッド #{method_name} が見つかりません。", object_id: id, color: '#ff4444')
        return "アクセス拒否: キーオブジェクトは #{method_name} を持っていません。"
      end

      unless key_object.send(method_name) == true
        engine.record_event('error', "認証失敗: #{method_name} が true を返しませんでした。", object_id: id, color: '#ff4444')
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
        { icon: '🔒', text: @variables[:hacked] ? 'Hacked' : 'Secure', level: @variables[:hacked] ? 3 : 2 }
      ],
      actions: [
        { label: 'Attempt Hack', code: "#{id}.unlock_with(key)", disabled: @variables[:hacked] }
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
      # ヒント: 50個のメソッドを手作業で定義するのは無謀だ。
      # method_missing と respond_to_missing? を使ってみよう。
    RUBY
  end
end
