import React, { useState, useEffect } from 'react';

// Action templates per class
const ACTIONS = {
  Door: (obj) => [
    { label: "🔓 鍵を開ける",    code: `door.unlock`,  disabled: !obj.variables.locked },
    { label: "🚪 扉を開く",      code: `door.open`,    disabled: obj.variables.locked },
    { label: "🔒 鍵をかける",    code: `door.lock`,    disabled: obj.variables.locked },
    { label: "🚪 扉を閉める",    code: `door.close`,   disabled: !obj.variables.open },
  ],
  Chest: () => [
    { label: "🗝 鍵を使って開ける", code: "chest.unlock(key)" },
    { label: "📦 中を覗く",        code: "chest.open" },
  ],
  Key: () => [
    { label: "🔍 鍵を調べる", code: "key.inspect" },
  ],
  Tome: (obj) => [
    { label: "📜 読む", code: `${obj.id === 'tome_002' ? 'forbidden_tome' : 'tome'}.read` },
    { label: "💡 ヒントを聞く", code: `${obj.id === 'tome_002' ? 'forbidden_tome' : 'tome'}.tip` },
  ],
  Npc: () => [
    { label: "💬 話しかける",         code: "sage.talk" },
    { label: "❓ 呪いについて聞く",    code: "sage.ask('cursed')" },
    { label: "❓ クラスについて聞く",  code: "sage.ask('class')" },
    { label: "❓ メソッドについて聞く", code: "sage.ask('method')" },
  ],
};

// Friendly state labels
const getFriendlyState = (obj, allObjects) => {
  const labels = [];
  const v = obj.variables;

  if (v.cursed)           labels.push({ icon: '⛧', text: '強力な呪いがかかっています', level: 'danger' });
  if (v.locked === true)  labels.push({ icon: '🔒', text: '鍵がかかっています', level: 'warning' });
  if (v.locked === false) labels.push({ icon: '🔓', text: '鍵は開いています', level: 'ok' });
  if (v.open === true)    labels.push({ icon: '🚪', text: '扉が開いています', level: 'ok' });
  if (v.open === false && v.locked === false) labels.push({ icon: '🚪', text: '扉は閉じています', level: 'neutral' });
  if (v.read === true)    labels.push({ icon: '📖', text: '読み終わりました', level: 'ok' });

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
    </div>
  );
};

export default ObjectDetail;
