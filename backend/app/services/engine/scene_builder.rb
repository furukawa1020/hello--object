module Engine
  class SceneBuilder
    def initialize(world)
      @world = world
    end

    # DSL method to create an object
    def object(klass, id, name, description, **vars)
      # Ensure the class exists (e.g., Door, Key, Chest)
      begin
        object_class = klass.is_a?(Class) ? klass : Object.const_get(klass.to_s.camelize)
        obj = object_class.new(id: id, name: name, description: description)
        
        # Set initial instance variables
        vars.each do |k, v|
          obj.instance_variable_set("@#{k}", v)
        end
        
        # Initialize container if needed
        obj.initialize_container if obj.respond_to?(:initialize_container)
        
        @world.add_object(obj)
        obj
      rescue NameError => e
        Rails.logger.error "Failed to find class #{klass}: #{e.message}"
      end
    end

    # Helper for common objects
    def door(id, name, description, **vars)
      object(:door, id, name, description, **vars)
    end

    def key(id, name, description, **vars)
      object(:key, id, name, description, **vars)
    end

    def chest(id, name, description, **vars)
      object(:chest, id, name, description, **vars)
    end

    def tome(id, name, description, **vars)
      object(:tome, id, name, description, **vars)
    end

    def npc(id, name, description, **vars)
      object(:npc, id, name, description, **vars)
    end

    def mirror(id, name, description, **vars)
      object(:mirror, id, name, description, **vars)
    end

    def pedestal(id, name, description, **vars)
      object(:pedestal, id, name, description, **vars)
    end

    def world_gate(id, name, description, **vars)
      object(:world_gate, id, name, description, **vars)
    end
  end
end
