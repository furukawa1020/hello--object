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
          title: '真理への階梯へようこそ',
          content: 'ここは Ruby が支配する「実体化された世界」です。目の前のオブジェクトは、すべて Ruby のクラスから生成されています。',
          target: '.world-view'
        },
        {
          id: 'interact',
          title: 'オブジェクトとの対話',
          content: 'オブジェクトを選択して Actions ボタンを押すか、直接コードを書き込むことで世界に干渉できます。',
          target: '.object-detail'
        },
        {
          id: 'ruby',
          title: 'Ruby の力',
          content: '魔法の源は Ruby そのものです。`door.open` と唱えれば道が開けるでしょう。呪われたオブジェクトはクラスごと書き換えてください。',
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
