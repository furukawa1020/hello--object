module Engine
  class EventRecorder
    def self.record(event_name, data = {})
      Thread.current[:game_events] ||= []
      meta = WorldManager::EVENT_METADATA[event_name.to_s] || { icon: '◈', text: event_name, color: '#888' }
      Thread.current[:game_events] << { 
        name: event_name, 
        data: data, 
        meta: meta,
        timestamp: Time.now.to_i 
      }
    end

    def self.start_session
      Thread.current[:game_events] = []
    end

    def self.collect
      events = Thread.current[:game_events] || []
      Thread.current[:game_events] = nil
      events
    end
  end
end
