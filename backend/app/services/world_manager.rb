class WorldManager
  def self.world
    @world ||= Engine::World.new.tap { |w| initialize_world(w) if w.objects.empty? }
  end

  EVENT_METADATA = {
    'door_unlocked'      => { icon: '🔓', text: '扉の鍵が開いた', color: '#3aff8a' },
    'door_locked'        => { icon: '🔒', text: '扉に鍵がかかった', color: '#ff993a' },
    'door_opened'        => { icon: '🚪', text: '扉が開いた！',   color: '#3aff8a' },
    'chest_unlocked'     => { icon: '🗝',  text: 'チェストが開錠された', color: '#3aff8a' },
    'chest_opened'       => { icon: '📦', text: 'チェストが開いた', color: '#ffcc44' },
    'npc_talked'         => { icon: '💬', text: '語りかけた',     color: '#60d0ff' },
    'tome_opened'        => { icon: '📜', text: '古文書が読まれた', color: '#c8a0ff' },
    'mirror_reflected'   => { icon: '🔮', text: '鏡が反射した',   color: '#c8a0ff' },
    'pedestal_activated' => { icon: '⚡', text: '台座が起動した！', color: '#ffcc44' },
    'object_revealed'    => { icon: '✨', text: '新たなオブジェクトが現れた！', color: '#ff79c6' },
    'glitch_minor'       => { icon: '〰️', text: '界面のゆらぎ', color: '#ffec3d' },
    'glitch_major'       => { icon: '🌫️', text: '現実の剥離', color: '#ff4d4f' },
    'glitch_error'       => { icon: '⚡', text: '整合性エラー', color: '#cf1322' },
    'system_reset'       => { icon: '☢️', text: '現実再起動', color: '#f5222d' },
  }.freeze

  def self.initialize_world(target_world = nil)
    @world = target_world if target_world
    @world ||= Engine::World.new
    @world.clear
    Engine::EventRecorder.world = @world

    # ═══════════════════════════════════════════════════
    # Scene 1: Entry Point — THE BOOT SEQUENCE
    # ═══════════════════════════════════════════════════
    @world.define_scene :the_first_room, 
      label: 'ACCESS_TERMINAL', 
      description: '初期化されたデータ空間。現実の整合性を確認せよ。',
      objectives: [
        { id: 'obj_open_door', text: '基本アクセス扉を解放せよ', target: 'door_001' },
        { id: 'obj_activate_plate', text: '古代感圧板に100以上の質量を検知させよ', target: 'plate_001' },
        { id: 'obj_pass_gate', text: '第一防壁を突破せよ', target: 'hgate_001' }
      ]
    
    @world.define_scene :the_sealed_chamber, 
      label: 'CRYPTO_CHAMBER', 
      description: '高度にカプセル化された領域。クラス定義の改変が求められる。',
      objectives: [
        { id: 'obj_safe_hack', text: '絶対金庫をモンキーパッチで解錠せよ', target: 'safe_001' },
        { id: 'obj_golem_dance', text: 'ゴーレムに特異メソッドを読み込ませて満足させよ', target: 'golem_001' }
      ]

    @world.define_scene :the_archive, 
      label: 'DATA_ARCHIVE', 
      description: '禁忌の知識が蓄積された領域。例外処理(rescue)を使いこなせ。',
      objectives: [
        { id: 'obj_tome_rescue', text: '禁断の魔導書から例外を捕捉して知識を抽出せよ', target: 'tome_forbidden' }
      ]

    @world.define_scene :the_departure, 
      label: 'CORE_MAINFRAME', 
      description: 'システムの心臓部。メタプログラミングの真髄を見せよ。',
      objectives: [
        { id: 'obj_mainframe_hack', text: 'メインフレームの50重認証を自動突破せよ', target: 'mainframe_001' },
        { id: 'obj_victory', text: '真理の門を解放して帰還せよ', target: 'gate_exit' }
      ]

    @world.scene :the_first_room do
      door :door_001, 'アクセス扉',
           '設計図(class Door)から生成された最初のインスタンス。`open`を呼べ。',
           locked: true, open: false

      k = key :key_001, 'セッション・キー', '眩い光を放つ古い鍵。重さは 150 ある。'
      c = chest :chest_001, 'データ・チェスト', 'オブジェクトが格納されたバッファ領域。'
      c.add_item(k)

      tome :tome_001, '古文書「世界の法則」',
           'ほこりをかぶった羊皮紙の束。「すべてのオブジェクトはクラスのインスタンスである」'

      weight_plate :plate_001, '古代の感圧板', '重さ100以上のオブジェクトを乗せると起動する。'
      heavy_gate :hgate_001, '第一防壁', '感圧板と連動している。`hgate.open`で突破せよ。', plate_id: :plate_001
    end

    @world.scene :the_sealed_chamber do
      door :cursed_door, '呪印の扉', '禍々しいオーラを放つ扉。あらゆる鍵を拒絶する。', locked: true, cursed: true
      unbreakable_safe :safe_001, '絶対金庫', '絶対に開かない。ソースコード(class UnbreakableSafe)をREPLから書き換えろ。'
      golem_gatekeeper :golem_001, '門番ゴーレム', '「dance」メソッドを持つ「何か」を提示(present)せよ。'
    end

    @world.scene :the_archive do
      tome :tome_003, '「継承」の書', 'クラスの家系図について。`Door.ancestors` を試せ。'
      tome :tome_005, '「動的性」の証', 'Rubyは実行中に自らを書き換える。これをモンキーパッチという。'
      forbidden_tome :tome_forbidden, '禁断の魔導書', 'そのまま読むと例外が発生する。begin..rescue で安全に読め。'
    end

    @world.scene :the_departure do
      world_gate :gate_exit, '真理の門', '世界の終わりを示す門。これを抜ければあなたは真のRubyistだ。'
      glitch :glitch_001, 'ノイズの塊', '実体のないバグの集積。`glitch.neutralize!`を定義して無効化せよ。'
      core_mainframe :mainframe_001, '中枢メインフレーム', '50個のauthメソッドを要求する。method_missing を使え。'

      npc :gatekeeper_001, '門番のホログラム', 'アクセス権限を監視している。',
          branches: {
            'start' => { lines: ["…権限なき者の通行は認められません。"], auto_next: 'intro' },
            'intro' => { lines: ["門を開きたいなら、システムを安定させ、メインフレームを制圧しなさい。"], },
          }
    end
  end

  ALIASES = {
    'door'            => 'door_001',
    'chest'           => 'chest_001',
    'key'             => 'key_001',
    'plate'           => 'plate_001',
    'hgate'           => 'hgate_001',
    'tome'            => 'tome_001',
    'sage'            => 'sage_001',
    'mirror'          => 'mirror_001',
    'safe'            => 'safe_001',
    'golem'           => 'golem_001',
    'cursed_door'     => 'cursed_door',
    'forbidden_tome'  => 'tome_forbidden',
    'warlock'         => 'warlock_001',
    'pedestal'        => 'pedestal_001',
    'tome_sealed'     => 'tome_sealed',
    'secret_tome'     => 'tome_sealed',
    'tome_003'        => 'tome_003',
    'tome_004'        => 'tome_004',
    'tome_005'        => 'tome_005',
    'mirror_002'      => 'mirror_002',
    'librarian'       => 'librarian_001',
    'mainframe'       => 'mainframe_001',
    'gate'            => 'gate_exit',
    'gatekeeper'      => 'gatekeeper_001',
    'glitch'          => 'glitch_001',
  }.freeze

  def self.get_object(name)
    id = ALIASES.fetch(name.to_s, name.to_s)
    world.find_object(id)
  end

  def self.all_objects
    world.objects.values
  end

  def self.registry
    w = world
    result = {}
    ALIASES.each do |alias_name, obj_id|
      obj = w.find_object(obj_id)
      result[alias_name] = obj if obj
    end
    
    # Also expose objects created dynamically (materialized) by their ID
    w.objects.each do |id, obj|
      next if ALIASES.values.include?(id)
      result[id] = obj
    end

    result.compact
  end

  def self.reset
    [Door, Chest, Key, Tome, Npc, Mirror, Pedestal, WorldGate, Glitch, WeightPlate, HeavyGate, UnbreakableSafe, GolemGatekeeper, ForbiddenTome, CoreMainframe].each do |klass|
      load Rails.root.join('app', 'models', "#{klass.name.underscore}.rb").to_s rescue nil
    end
    RubyEvaluator.reset_instability
    initialize_world
  end
end
