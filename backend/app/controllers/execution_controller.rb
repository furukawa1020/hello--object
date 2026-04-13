class ExecutionController < ApplicationController
  def execute
    code = params[:code]
    result = RubyEvaluator.evaluate(code)
    render json: result
  end

  def state
    render json: {
      success: true,
      objects: WorldManager.all_objects.map(&:state),
      scenes: WorldManager.world.scene_metadata.values,
      is_victory: WorldManager.world.victory?,
      tutorial: WorldManager.world.tutorial_steps
    }
  end

  def reset
    WorldManager.reset
    render json: {
      success: true,
      message: "World has been restored to its original state.",
      objects: WorldManager.all_objects.map(&:state),
      scenes: WorldManager.world.scene_metadata.values,
      is_victory: WorldManager.world.victory?,
      tutorial: WorldManager.world.tutorial_steps
    }
  end

  def methods_for
    obj = WorldManager.get_object(params[:name])
    if obj
      methods = obj.class.public_instance_methods(false).map(&:to_s).sort
      render json: { success: true, methods: methods, class_name: obj.class.name }
    else
      render json: { success: false, error: "Object not found" }
    end
  end
end
