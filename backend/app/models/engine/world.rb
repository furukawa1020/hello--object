module Engine
  class World
    attr_reader :objects, :current_scene_id, :scene_metadata

    def initialize
      @objects = {}
      @hidden_objects = {}
      @current_scene_id = nil
      @scene_metadata = {}
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
