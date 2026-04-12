module Engine
  class EventRecorder
    @events = []
    @world = nil

    class << self
      attr_accessor :world

      def start_session
        @events = []
      end

      def record(name, data = {})
        @events << { name: name, data: data }
      end

      def collect
        @events.dup
      end
    end
  end
end
