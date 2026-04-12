import React, { useState, useEffect } from 'react';

// Map object ID to the alias used in the evaluator registry
const idAlias = (obj) => {
  const map = {
    door_001:    'door',
    chest_001:   'chest',
    key_001:     'key',
    tome_001:    'tome',
    tome_003:    'tome_003',
    tome_004:    'tome_004',
    tome_005:    'tome_005',
    sage_001:    'sage',
    mirror_001:  'mirror',
    mirror_002:  'mirror_002',
    cursed_door: 'cursed_door',
    tome_002:    'forbidden_tome',
    warlock_001: 'warlock',
    pedestal_001:'pedestal',
    librarian_001:'librarian',
    gate_exit:     'gate',
    gatekeeper_001:'gatekeeper',
  };
  return map[obj.id] || obj.id;
};

// Action templates per class
const ACTIONS = {
  Door: (obj) => {
    const a = idAlias(obj);
    return [
      { label: `🔓 鍵を開ける`,  code: `${a}.unlock`,  disabled: !obj.variables.locked },
      { label: `🚪 扉を開く`,    code: `${a}.open`,    disabled: obj.variables.locked },
      { label: `🔒 鍵をかける`,  code: `${a}.lock`,    disabled: obj.variables.locked },
      { label: `🚪 扉を閉める`,  code: `${a}.close`,   disabled: !obj.variables.open },
    ];
  },
  Chest: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '🗝 鍵を使って開ける', code: `${a}.unlock(key)` },
      { label: '📦 中を覗く',        code: `${a}.open` },
    ];
  },
  Key: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '🔍 鍵を調べる',     code: `${a}.inspect` },
      { label: '🔮 鏡で反射する',   code: `mirror.reflect(${a})` },
    ];
  },
  Tome: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '📜 読む',         code: `${a}.read` },
      { label: '💡 ヒントを1つ',  code: `${a}.tip` },
      { label: '🔮 鏡で反射する', code: `mirror.reflect(${a})` },
    ];
  },
  Npc: (obj) => {
    const a = idAlias(obj);
    const talkCode = a === 'warlock' ? `warlock.talk` : `${a}.talk`;
    return [
      { label: '💬 話しかける',            code: talkCode },
      { label: '❓ 呪いについて聞く',       code: `${a}.ask('cursed')` },
      { label: '❓ クラスについて聞く',     code: `${a}.ask('class')` },
      { label: '🤝 答える (yes/no等)',     code: `${a}.respond('yes')` },
      { label: '🔮 鏡で反射する',          code: `mirror.reflect(${a})` },
    ];
  },
  Mirror: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '🚪 ドアを反射',    code: `${a}.reflect(door)` },
      { label: '📦 チェストを反射', code: `${a}.reflect(chest)` },
      { label: '🗝 鍵を反射',     code: `${a}.reflect(key)` },
      { label: '🔮 覗き込む',     code: `${a}.gaze` },
      { label: '✕ 消す',         code: `${a}.reflect` },
    ];
  },
  Pedestal: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '🗝 鍵を置く',     code: `${a}.place(key)` },
      { label: '↩ アイテムを外す', code: `${a}.remove` },
    ];
  },
  WorldGate: (obj) => {
    const a = idAlias(obj);
    return [
      { label: '🔑 認証する',     code: `${a}.authorize('ADMIN_ACCESS')` },
      { label: '🚪 門を開く',     code: `${a}.open` },
    ];
  },
};

// Friendly state labels
const getFriendlyState = (obj, allObjects) => {
  const labels = [];
  const v = obj.variables;

  if (v.cursed)             labels.push({ icon: '⛧', text: '強力な呪いがかかっています', level: 'danger' });
  if (v.locked === true)    labels.push({ icon: '🔒', text: '鍵がかかっています', level: 'warning' });
  if (v.locked === false)   labels.push({ icon: '🔓', text: '鍵は開いています', level: 'ok' });
  if (v.open === true)      labels.push({ icon: '🚪', text: '扉が開いています', level: 'ok' });
  if (v.open === false && v.locked === false) labels.push({ icon: '🚪', text: '扉は閉じています', level: 'neutral' });
  if (v.read === true)      labels.push({ icon: '📖', text: '読み終わりました', level: 'ok' });
  if (v.activated === true) labels.push({ icon: '⚡', text: '台座が起動中！', level: 'ok' });
  if (v.reflecting)         labels.push({ icon: '🔮', text: `映中: ${v.reflecting}`, level: 'neutral' });
  if (v.reflection_count > 0) labels.push({ icon: '◈', text: `${v.reflection_count}回反射`, level: 'neutral' });

  if (v.items && v.items.length > 0) {
    const names = v.items.map(id => {
      const item = allObjects.find(o => o.id === id);
      return item ? item.name : id;
    });
    labels.push({ icon: '📦', text: `中身: ${names.join(', ')}`, level: 'neutral' });
  }

  return labels;
};

// Class schematic snippets
const SCHEMATICS = {
  Door: `class Door < GameObject
  def unlock
    if @cursed
      raise "呪われた扉は開けられない"
    end
    @locked = false
  end

  def open
    if @cursed || @locked
      raise "開かない"
    end
    @open = true
  end
end`,
  Chest: `class Chest < GameObject
  include Container

  def unlock(key_obj)
    if key_obj.is_a?(Key)
      @locked = false
    end
  end
end`,
  Tome: `class Tome < GameObject
  def read
    @read = true
    # ヒントを返す
  end

  def tip
    knowledge_lines.sample
  end
end`,
  Npc: `class Npc < GameObject
  def talk
    # セリフを順番に返す
    @lines[@talked_count % @lines.length]
  end

  def ask(topic)
    # トピックに応じた回答を返す
    responses[topic]
  end
end`,
  WorldGate: `class WorldGate < GameObject
  def authorize(key)
    @authorized = (key == "ADMIN_ACCESS")
  end

  def open
    if @authorized && @integrity <= 0
      @open = true
    end
  end
end`,
};

const ObjectDetail = ({ object, onAction, objects }) => {
  const [showSchematic, setShowSchematic] = useState(false);

  useEffect(() => {
    setShowSchematic(false);
  }, [object?.id]);

  if (!object) {
    return (
      <div className="object-detail tactical-panel empty">
        <div className="empty-hint">
          <div className="empty-icon">◈</div>
          <p>オブジェクトを選択してください</p>
          <p className="empty-sub">世界のオブジェクトをクリックすると、詳細情報と操作が表示されます。</p>
        </div>
      </div>
    );
  }

  const actions = (ACTIONS[object.class_name] || (() => []))(object);
  const stateLabels = getFriendlyState(object, objects || []);
  const schematic = SCHEMATICS[object.class_name];
  const isCursed = object.variables.cursed;

  return (
    <div className={`object-detail tactical-panel ${isCursed ? 'is-cursed-panel' : ''}`}>
      <div className="detail-header">
        <div className="detail-title">
          <h3>{object.name}</h3>
          <span className="class-tag">{object.class_name}</span>
        </div>
        {isCursed && <div className="curse-badge">⛧ CURSED</div>}
      </div>

      <p className="detail-description">{object.description}</p>

      {/* Friendly State */}
      {stateLabels.length > 0 && (
        <div className="beginner-guide">
          {stateLabels.map((label, i) => (
            <div key={i} className={`status-label level-${label.level}`}>
              <span className="status-icon">{label.icon}</span>
              {label.text}
            </div>
          ))}
        </div>
      )}

      {/* Cursed Door special hint */}
      {isCursed && (
        <div className="metaprog-hint">
          <div className="metaprog-hint-title">⚡ ハックのヒント</div>
          <pre className="metaprog-sample mono">{`class Door
  def unlock
    @cursed = false
    @locked = false
    "呪いを書き換えた！"
  end
end`}</pre>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="action-section">
          <h4>Actions</h4>
          <div className="action-buttons">
            {actions.map(action => (
              <button
                key={action.code}
                onClick={() => onAction(action.code)}
                className={`action-btn ${action.disabled ? 'disabled' : ''}`}
                disabled={action.disabled}
              >
                <span className="action-label">{action.label}</span>
                <span className="action-code-hint">{action.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Class Schematic toggle */}
      {schematic && (
        <div className="schematic-section">
          <button
            className="schematic-toggle"
            onClick={() => setShowSchematic(s => !s)}
          >
            {showSchematic ? '▼' : '▶'} Class Schematic <span className="mono-label">.rb</span>
          </button>
          {showSchematic && (
            <pre className="schematic-code mono">{schematic}</pre>
          )}
        </div>
      )}

      {/* Technical State */}
      <div className="state-section">
        <h4>Technical State <span className="mono-label">@variables</span></h4>
        <div className="variables-list mono">
          {Object.entries(object.variables).map(([key, value]) => (
            <div key={key} className="variable-item">
              <span className="var-name">@{key}</span>
              <span className="var-operator">=</span>
              <span className={`var-value ${typeof value === 'boolean' ? (value ? 'true' : 'false') : typeof value}`}>
                {JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Notes */}
      <div className="notes-section">
        <div className="notes-header">
          <h4>Player Notes <span className="mono-label">.note</span></h4>
          <button className="add-note-btn" onClick={() => onAction(`${idAlias(object)}.note "ここにメモを書く"`)}>
            + Add Note
          </button>
        </div>
        <div className="notes-list">
          {object.notes && object.notes.length > 0 ? (
            object.notes.map((note, i) => (
              <div key={i} className="note-item">
                <span className="note-bullet">▹</span>
                <span className="note-text">{note}</span>
              </div>
            ))
          ) : (
            <div className="notes-empty">メモはありません。</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectDetail;
