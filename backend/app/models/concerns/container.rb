module Container
  def self.included(base)
    base.class_eval do
      attr_reader :items
    end
  end

  def initialize_container
    @items = []
  end

  def add_item(item)
    @items << item
    item.instance_variable_set(:@parent, self) if item.is_a?(GameObject)
    Engine::EventRecorder.record('item_added', { container_id: self.id, item_id: item.id })
    "#{item.name}を#{self.name}に入れました。"
  end

  def remove_item(item)
    if @items.delete(item)
      item.instance_variable_set(:@parent, nil) if item.is_a?(GameObject)
      Engine::EventRecorder.record('item_removed', { container_id: self.id, item_id: item.id })
      item
    else
      nil
    end
  end
end
