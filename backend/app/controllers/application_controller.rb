class ApplicationController < ActionController::API
  rescue_from StandardError do |e|
    render json: { 
      success: false, 
      error: e.message, 
      backtrace: e.backtrace.first(10) 
    }, status: 500
  end
end
