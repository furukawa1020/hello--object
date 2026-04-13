class WorldManager
  @world = Engine::World.new

  def self.initialize_world
    @world.clear
    Engine::EventRecorder.world = @world

    # ═══════════════════════════════════════════════════
    # Scene 1: The First Room — 入門
    # ═══════════════════════════════════════════════════
    @world.define_scene :the_first_room, label: '第一の間', description: '入門の部屋。まずはオブジェクトと対話することを学ぼう。'
    @world.define_scene :the_sealed_chamber, label: '封印の間', description: '呪いに閉ざされた部屋。通常の手段では突破できない。'
    @world.define_scene :the_archive, label: '記録の間', description: '知識の書庫。Rubyの奥深い概念が記録されている。'
    @world.define_scene :the_departure, label: '脱出口', description: '真理への出口。最後の試練が待ち受けている。'

    @world.scene :the_first_room do
      door :door_001, '古びた木の扉',
           '錆びついた蝶番が軋む重厚な木製の扉。なにかが向こう側に待っている。',
           locked: true, open: false

      k = key :key_001, '黄金の鍵', '眩い光を放つ古い鍵。チェストの錠前に合いそうだ。'
      c = chest :chest_001, '鉄のチェスト', '重厚な鉄で作られたチェスト。イニシャルが刻まれている。'
      c.add_item(k)

      tome :tome_001, '古文書「世界の法則」',
           'ほこりをかぶった羊皮紙の束。「すべてのオブジェクトはクラスのインスタンスである」と書かれている。'

      npc :sage_001, '石像の賢者',
          '台座に腰かける老人の石像。しかし、目が光っている気がする。'

      object :mirror, :mirror_001, '知識の鏡',
             '磨き上げられた鏡。`mirror.reflect(オブジェクト)` で対象の本質を映し出す。'
    end

    # ═══════════════════════════════════════════════════
    # Scene 2: The Sealed Chamber — 呪いとメタプログラミング
    # ═══════════════════════════════════════════════════
    @world.scene :the_sealed_chamber do
      door :cursed_door, '呪印の扉',
           '禍々しいオーラを放つ扉。刻まれた呪印が、あらゆる鍵を拒絶する。',
           locked: true, cursed: true

      tome :tome_002, '禁断の書',
           '焦げた表紙の本。ページには「class Door を再オープンし、呪いを書き換えよ」とある。'

      npc :warlock_001, '術師の亡霊',
          'かつてこの扉に呪いをかけた術師の残留思念。',
          lines: [
            "ふふ…その扉は永遠に開かぬ。",
            "…あら、あなたはコードを書けるのか。",
            "Rubyでは class は常に再オープンできる。それが呪いの抜け穴だ。",
            "`class Door; def unlock; @cursed=false; @locked=false; end; end` を試してみるがいい。",
            "呪いを解いた後、`cursed_door.unlock` → `cursed_door.open` の順で唱えよ。"
          ]

      # Pedestal reveals the 'tome_sealed' (secret guide) when activated with key
      object :pedestal, :pedestal_001, '試練の台座',
             '台座に刻まれた文字：「正しき鍵を捧げよ。さすれば知恵が授けられん。」',
             accepts: 'Key', reveals: 'tome_sealed',
             reward_message: '黄金の鍵を台座に捧げた。光が部屋を満たす…'
    end

    # ═══════════════════════════════════════════════════
    # Hidden objects — revealed by puzzle chains
    # ═══════════════════════════════════════════════════
    secret_tome = Tome.new(
      id: 'tome_sealed',
      name: '封印されていた書',
      description: '台座の光が解き放った秘密の書。クリアへの手順が完全に記されている。'
    )
    # Override knowledge_lines for specific content
    secret_tome.instance_variable_set(:@knowledge, [
      "【手順1】`class Door` を再オープンして `unlock` を書き換える",
      "【手順2】`cursed_door.unlock` で鍵を解除する",
      "【手順3】`cursed_door.open` で扉を開ける",
      "コード例：class Door; def unlock; @cursed=false; @locked=false; '解呪完了'; end; end"
    ])
    @world.hide_object(secret_tome)

    # ═══════════════════════════════════════════════════
    # Scene 3: The Archive — 深い知識（第三の間）
    # ═══════════════════════════════════════════════════
    @world.scene :the_archive do
      tome :tome_003, '「継承」の書',
           'クラスの家系図について。`Door.ancestors` を試してみよ。'

      tome :tome_004, '「状態」の記録',
           '`@` で始まる変数はインスタンス変数。`door.instance_variables` で一覧を見よ。'

      tome :tome_005, '「動的性」の証',
           'Rubyは実行中に自らを書き換える。これをモンキーパッチという。class を再オープンすれば実証できる。'

      object :mirror, :mirror_002, '記録の鏡',
             '世界の真実を映す鏡。`mirror_002.reflect(任意のオブジェクト)` で詳細を調べられる。'

      npc :librarian_001, '図書館の守護者',
          '古い書物に囲まれた沈黙の番人。',
          lines: [
            "ここは知識の間です。書籍に記された真理があなたを導くでしょう。",
            "tome_003.read → tome_004.read → tome_005.read の順に読むことをお勧めします。",
            "`1.class` → Integer。`Integer.superclass` → Numeric。これが継承の連鎖です。",
            "`Door.instance_methods(false)` で Door 独自のメソッド一覧を見られます。",
            "すべての Ruby クラスは BasicObject から始まります。`Door.ancestors` を試してみてください。"
          ]
    end

    # ═══════════════════════════════════════════════════
    # Scene 4: The Departure — 脱出口
    # ═══════════════════════════════════════════════════
    @world.scene :the_departure do
      world_gate :gate_exit, '真理の門',
                 '世界の終わりを示す巨大な門。これを抜ければ、あなたは真のRubyistとなる。'

      glitch :glitch_001, 'ノイズの塊',
             '実体のないバグの集積。世界の整合性を乱し、門の開放を阻害している。'

      npc :gatekeeper_001, '門番のホログラム',
          '実体のない青白い光。アクセス権限を監視している。',
          branches: {
            'start' => {
              lines: ["…権限なき者の通行は認められません。"],
              auto_next: 'intro'
            },
            'intro' => {
              lines: ["あなたは門を開きたいのですか？ `respond('yes')` と答えなさい。"],
            },
            'yes' => {
              lines: [
                "ならば「ADMIN_ACCESS」という鍵を authority メソッドに渡しなさい。",
                "しかし…あの「ノイズの塊」がシステムを汚染している限り、門は反応しません。",
                "まずは `glitch` の特異クラス（singleton_class）を書き換え、`neutralize!` を定義しなさい。"
              ],
            }
          }
    end
  end

  ALIASES = {
    'door'            => 'door_001',
    'chest'           => 'chest_001',
    'key'             => 'key_001',
    'tome'            => 'tome_001',
    'sage'            => 'sage_001',
    'mirror'          => 'mirror_001',
    'cursed_door'     => 'cursed_door',
    'forbidden_tome'  => 'tome_002',
    'warlock'         => 'warlock_001',
    'pedestal'        => 'pedestal_001',
    'tome_sealed'     => 'tome_sealed',
    'secret_tome'     => 'tome_sealed',
    'tome_003'        => 'tome_003',
    'tome_004'        => 'tome_004',
    'tome_005'        => 'tome_005',
    'mirror_002'      => 'mirror_002',
    'librarian'       => 'librarian_001',
    'gate'            => 'gate_exit',
    'gatekeeper'      => 'gatekeeper_001',
    'glitch'          => 'glitch_001',
  }.freeze

  def self.get_object(name)
    id = ALIASES.fetch(name.to_s, name.to_s)
    @world.find_object(id)
  end

  def self.all_objects
    @world.objects.values
  end

  def self.registry
    result = {}
    ALIASES.each do |alias_name, obj_id|
      obj = @world.find_object(obj_id)
      result[alias_name] = obj if obj
    end
    
    # Also expose objects created dynamically (materialized) by their ID
    @world.objects.each do |id, obj|
      next if ALIASES.values.include?(id)
      result[id] = obj
    end

    result.compact
  end

  def self.reset
    [Door, Chest, Key, Tome, Npc, Mirror, Pedestal, WorldGate, Glitch].each do |klass|
      load Rails.root.join('app', 'models', "#{klass.name.underscore}.rb").to_s rescue nil
    end
    RubyEvaluator.reset_instability
    initialize_world
  end
end

# Initialize on load
WorldManager.initialize_world
