class UnbreakableSafe < GameObject
  def initialize(id:, name: '絶対金庫', description: 'いかなる物理的干渉も受け付けない暗号金庫。クラス自体を書き換えるしか開ける方法はなさそうだ。')
    super(id: id, name: name, description: description)
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
        { label: 'Attempt Unlock', code: "#{id}.unlock", disabled: @variables[:open] },
        { label: 'Monkey Patch!', code: "class UnbreakableSafe\n  def unlock\n    @variables[:open] = true\n    'Hacked!'\n  end\nend\n#{id}.unlock", disabled: false }
      ],
      completed: @variables[:open]
    )
  end

  def schematic
    <<~RUBY
      class UnbreakableSafe < GameObject
        def unlock
          # HARDCODED: always returns false
          @variables[:open] = false
          return "Access Denied"
        end
      end

      # Your mission: reopen this class and override unlock!
      class UnbreakableSafe
        def unlock
          @variables[:open] = true
          "Hacked!"
        end
      end
    RUBY
  end
end
