class WorldManager
  @world = Engine::World.new

  def self.initialize_world
    @world.clear

    # ═══════════════════════════════════════════════════
    # Scene 1: The First Room — 入門
    # ═══════════════════════════════════════════════════
    @world.scene :the_first_room do
      door :door_001, '古びた木の扉',
           '錆びついた蝶番が軋む重厚な木製の扉。なにかが向こう側に待っている。',
           locked: true, open: false

      k = key :key_001, '黄金の鍵', '眩い光を放つ古い鍵。チェストのものと思われる。'
      c = chest :chest_001, '鉄のチェスト', '重厚な鉄で作られたチェスト。イニシャルが刻まれている。'
      c.add_item(k)

      tome :tome_001, '古文書「世界の法則」',
           'ほこりをかぶった羊皮紙の束。文字が浮かび上がっている。'

      npc :sage_001, '石像の賢者',
          '台座に腰かける老人の石像。しかし、目が光っている気がする。'

      object :mirror, :mirror_001, '知識の鏡',
             'なにかを映すと、その本質を教えてくれるとされる古い鏡。`mirror.reflect(オブジェクト)` で使う。'
    end

    # ═══════════════════════════════════════════════════
    # Scene 2: The Sealed Chamber — 呪いとメタプログラミング
    # ═══════════════════════════════════════════════════
    @world.scene :the_sealed_chamber do
      door :cursed_door, '呪印の扉',
           '禍々しいオーラを放つ扉。刻まれた呪印が、すべての鍵を拒絶する。',
           locked: true, cursed: true

      tome :tome_002, '禁断の書',
           '焦げた表紙の本。「クラスを再オープンせよ」と書かれている。'

      npc :warlock_001, '術師の亡霊',
          'かつてこの扉に呪いをかけた術師の残留思念。',
          lines: [
            "ふふ…その扉は永遠に開かぬ。",
            "…あら、あなたはコードを書けるのか。",
            "Rubyでは class は常に再オープンできる。それが呪いの抜け穴だ。",
            "`class Door; def unlock; @cursed=false; @locked=false; end; end` を試してみるがいい。"
          ]

      object :pedestal, :pedestal_001, '試練の台座',
             '魔法の台座。正しいオブジェクトを置くと何か起こる。',
             accepts: 'Key', reward_message: '黄金の鍵を台座に置くと、呪印の一部が薄れた…！しかし扉はまだ開かない。'
    end

    # ═══════════════════════════════════════════════════
    # Scene 3: The Archive — 深い知識（第三の間）
    # ═══════════════════════════════════════════════════
    @world.scene :the_archive do
      tome :tome_003, '「継承」の書',
           '「子は親の知識を引き継ぐ。しかし自らの定義を持つこともできる。」'

      tome :tome_004, '「状態」の記録',
           '「@ で始まる変数はインスタンス変数だ。オブジェクト固有の状態を保存する。」'

      tome :tome_005, '「動的性」の証',
           '「Rubyは実行中に自らを書き換える。これをモンキーパッチという。」'

      object :mirror, :mirror_002, '記録の鏡',
             '世界の記録を映す鏡。どんなオブジェクトでも `mirror_002.reflect(obj)` で詳細を調べられる。'

      npc :librarian_001, '図書館の守護者',
          '古い書物に囲まれた沈黙の番人。',
          lines: [
            "ここは知識の間です。书籍に記された真理があなたを導くでしょう。",
            "tome_003.read で継承の記録を。tome_004.read で状態の記録を読めます。",
            "`1.class` → Integer。`Integer.superclass` → Numeric。これが継承の連鎖です。",
            "すべての Ruby クラスは BasicObject から始まります。`BasicObject.ancestors` を試してみてください。"
          ]
    end
  end

  def self.get_object(name)
    id = ALIASES.fetch(name.to_s, name.to_s)
    @world.find_object(id)
  end

  ALIASES = {
    'door'           => 'door_001',
    'chest'          => 'chest_001',
    'key'            => 'key_001',
    'tome'           => 'tome_001',
    'sage'           => 'sage_001',
    'mirror'         => 'mirror_001',
    'cursed_door'    => 'cursed_door',
    'forbidden_tome' => 'tome_002',
    'warlock'        => 'warlock_001',
    'pedestal'       => 'pedestal_001',
    'tome_003'       => 'tome_003',
    'tome_004'       => 'tome_004',
    'tome_005'       => 'tome_005',
    'mirror_002'     => 'mirror_002',
    'librarian'      => 'librarian_001',
  }.freeze

  def self.all_objects
    @world.objects.values
  end

  def self.registry
    result = {}
    ALIASES.each do |alias_name, obj_id|
      obj = @world.find_object(obj_id)
      result[alias_name] = obj if obj
    end
    result.compact
  end

  def self.reset
    # Reload model classes so monkey-patches are removed
    [Door, Chest, Key, Tome, Npc, Mirror, Pedestal].each do |klass|
      load Rails.root.join('app', 'models', "#{klass.name.underscore}.rb").to_s rescue nil
    end
    initialize_world
  end
end

# Initialize on load
WorldManager.initialize_world
