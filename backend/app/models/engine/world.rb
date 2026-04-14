module Engine
  class World
    attr_reader :objects, :current_scene_id, :scene_metadata

    def initialize
      @objects = {}
      @hidden_objects = {}
      @current_scene_id = nil
      @scene_metadata = {}
    end

    def victory?
      # Opening the cursed door is the win condition
      d = find_object('cursed_door')
      d && d.instance_variable_get(:@open) == true
    end

    # Global tutorial steps for the Onboarding system
    def tutorial_steps
      [
        {
          id: 'intro',
          title: 'Ruby Interactive World へようこそ',
          content: 'ここは Ruby によって「実体化（インスタンス化）」されたプログラムの世界です。目の前のオブジェクトは、すべて設計図（クラス）に基づいています。',
          target: '.world-view'
        },
        {
          id: 'interact',
          title: 'オブジェクトの観測',
          content: 'オブジェクトを選択すると、その内部状態（プロパティ）や可能な操作（メソッド）を Actions パネルで確認できます。',
          target: '.object-detail'
        },
        {
          id: 'ruby',
          title: 'Ruby コードの実行',
          content: 'Magic Note にコードを記述し、世界を動かしましょう。`door.open` といった命令が基本です。呪われたオブジェクトは、クラス定義そのものを書き換えて解錠してください。',
          target: '.editor-section'
        }
      ]
    end

    def define_scene(id, label:, description:)
      @scene_metadata[id.to_s] = { id: id.to_s, label: label, description: description }
    end

    def add_object(obj)
      @objects[obj.id.to_s] = obj
    end

    # Hide an object — registered but not visible until revealed
    def hide_object(obj)
      @hidden_objects[obj.id.to_s] = obj
    end

    # Reveal a previously hidden object
    def reveal_object(id)
      id = id.to_s
      obj = @hidden_objects.delete(id)
      if obj
        @objects[id] = obj
        Engine::EventRecorder.record('object_revealed', { object_id: id, name: obj.name })
        obj
      end
    end

    def find_object(id)
      id = id.to_s
      @objects[id] || @hidden_objects[id]
    end

    def clear
      @objects = {}
      @hidden_objects = {}
    end

    # DSL method to define a scene
    def scene(id, &block)
      @current_scene_id = id
      SceneBuilder.new(self).instance_eval(&block)
    end

    def all_states
      @objects.values.map(&:state)
    end
  end
end
