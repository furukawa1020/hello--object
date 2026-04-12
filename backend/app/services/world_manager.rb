class WorldManager
  @world = Engine::World.new

  def self.initialize_world
    @world.clear

    # Scene 1: The First Room — tutorial area
    @world.scene :the_first_room do
      door :door_001, '古びた木の扉', '錆びついた蝶番が軋む、重厚な木製の扉。なにかが向こう側に待っている。', locked: true, open: false

      k = key :key_001, '黄金の鍵', '眩い光を放つ古い鍵。チェストのものと思われる。'
      c = chest :chest_001, '鉄のチェスト', '重厚な鉄で作られたチェスト。イニシャルが刻まれている。'
      c.add_item(k)

      tome :tome_001, '古文書「世界の法則」', 'ほこりをかぶった羊皮紙の束。文字が浮かび上がっている。'

      npc :sage_001, '石像の賢者', '台座に腰かける老人の石像。しかし、目が光っている気がする。'
    end

    # Scene 2: The Sealed Chamber — metaprogramming challenge
    @world.scene :the_sealed_chamber do
      door :cursed_door, '呪印の扉', '禍々しいオーラを放つ扉。刻まれた呪印が、すべての鍵を拒絶する。', locked: true, cursed: true
      tome :tome_002, '禁断の書', '焦げた表紙の本。「クラスを再オープンせよ」と書かれている。'
    end
  end

  def self.get_object(name)
    id = case name.to_s
         when 'door'        then 'door_001'
         when 'chest'       then 'chest_001'
         when 'key'         then 'key_001'
         when 'tome'        then 'tome_001'
         when 'sage'        then 'sage_001'
         when 'cursed_door' then 'cursed_door'
         when 'forbidden_tome' then 'tome_002'
         else name.to_s
         end
    @world.find_object(id)
  end

  def self.all_objects
    @world.objects.values
  end

  def self.registry
    {
      'door'          => get_object('door'),
      'chest'         => get_object('chest'),
      'key'           => get_object('key'),
      'tome'          => get_object('tome'),
      'sage'          => get_object('sage'),
      'cursed_door'   => get_object('cursed_door'),
      'forbidden_tome' => get_object('forbidden_tome')
    }.compact
  end

  def self.reset
    initialize_world
  end
end

# Initialize on load
WorldManager.initialize_world
