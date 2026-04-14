class UnbreakableSafe < GameObject
  def initialize(id, name: '絶対金庫', description: 'いかなる物理的干渉も受け付けない暗号金庫。クラス自体を書き換えるしか開ける方法はなさそうだ。')
    super(id, name: name, description: description)
    @variables[:open] = false
  end

  # This method is designed to be monkey-patched by the user!
  def unlock
    engine.record_event('error', "金庫はビクともしない。ソースコードの構造自体が解錠を拒んでいる。", object_id: id, color: '#ff4444')
    @variables[:open] = false
    "アクセス拒否。このメソッドは常に false を返すようにハードコードされている。"
  end

  def state_hash
    super.merge(
      tooltip: {
        name: @name,
        class_name: self.class.name,
        description: 'ソースコードの書き換え（モンキーパッチ）が必要。',
        warning: @variables[:open] ? 'ハック完了' : 'ハッキング待機中'
      },
      labels: [
        { icon: '📦', text: 'Secure Vault', level: 3 },
        { icon: '🛡️', text: @variables[:open] ? 'Patched' : 'Hardcoded', level: @variables[:open] ? 2 : 1 }
      ],
      actions: [
        { label: 'Attempt Unlock', code: "#{id}.unlock", disabled: @variables[:open] }
      ],
      completed: @variables[:open]
    )
  end

  def schematic
    <<~RUBY
      # #{self.class.name} のクラスを再定義して
      # unlock メソッドを上書き（オーバーライド）せよ！

      class UnbreakableSafe < GameObject
        def unlock
          # 変更前は絶対に false を返す
          @variables[:open] = false
          return "アクセス拒否" 
        end
      end
    RUBY
  end
end
