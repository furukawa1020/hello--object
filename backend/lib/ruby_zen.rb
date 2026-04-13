# RubyZen: A library for advanced object manipulation in the hello, object engine.

module RubyZen
  module Reflect
    def self.structure(obj)
      {
        class: obj.class,
        ancestors: obj.class.ancestors.take(5),
        methods: obj.public_methods(false),
        vars: obj.instance_variables.map { |v| [v, obj.instance_variable_get(v)] }.to_h
      }
    end
  end

  module Materialize
    def self.clone_and_modify(obj, new_name)
      # Simulates dynamic object creation in the engine
      "#{obj.class} '#{new_name}' was materialized from the void."
    end
  end

  module Logic
    def self.is_cursed?(obj)
      return false unless obj.respond_to?(:ui_labels)
      obj.ui_labels.any? { |l| l[:icon] == '⛧' }
    end
  end
end
