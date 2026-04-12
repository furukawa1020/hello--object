module Engine
  class World
    attr_reader :objects, :current_scene_id

    def initialize
      @objects = {}
      @current_scene_id = nil
    end

    def add_object(obj)
      @objects[obj.id.to_s] = obj
    end

    def find_object(id)
      @objects[id.to_s]
    end

    def clear
      @objects = {}
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
