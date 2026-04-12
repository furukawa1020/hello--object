class ExecutionController < ApplicationController
  def execute
    code = params[:code]
    result = RubyEvaluator.evaluate(code)
    render json: result
  end

  def state
    render json: {
      success: true,
      objects: WorldManager.all_objects.map(&:state)
    }
  end

  def reset
    WorldManager.reset
    render json: {
      success: true,
      message: "World has been restored to its original state.",
      objects: WorldManager.all_objects.map(&:state)
    }
  end
end
