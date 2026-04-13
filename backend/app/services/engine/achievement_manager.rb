module Engine
  class AchievementManager
    ACHIEVEMENTS = {
      monkey_patch: { id: 'ach_monkey', title: 'モンキーパッチの使い手', description: '既存のクラスを動的に拡張した' },
      singleton_class: { id: 'ach_singleton', title: '特異クラスの探求者', description: 'オブジェクトの特異クラスに介入した' },
      materializer: { id: 'ach_materializer', title: '創造主の第一歩', description: '新しいオブジェクトを世界に具現化させた' },
      ghost_in_the_machine: { id: 'ach_ghost', title: '機械の中の幽霊', description: '存在しないメソッドを定義・制御した' }
    }

    def self.analyze_execution(code, context)
      achievements = []
      
      # Simple regex checks for now, but in Ruby we could use AST if needed.
      # For Phase 16, we'll keep it simple but effective.
      if code.match?(/class\s+\w+/) && !code.match?(/<\s+GameObject/)
        achievements << ACHIEVEMENTS[:monkey_patch]
      end
      
      if code.include?('singleton_class') || code.include?('class\s*<<')
        achievements << ACHIEVEMENTS[:singleton_class]
      end

      if code.include?('method_missing') || code.include?('respond_to_missing?')
        achievements << ACHIEVEMENTS[:ghost_in_the_machine]
      end

      # Check for materialized objects (custom classes) in the world
      custom_objs = WorldManager.all_objects.select { |o| !WorldManager::ALIASES.values.include?(o.id) }
      if custom_objs.any?
        achievements << ACHIEVEMENTS[:materializer]
      end

      achievements.uniq
    end
  end
end
