import React from 'react';

const ObjectDetail = ({ object, onAction, objects }) => {
  if (!object) {
    return (
      <div className="object-detail tactical-panel empty">
        <p>オブジェクトを選択してください</p>
      </div>
    );
  }

  // Beginner-friendly state labels
  const getFriendlyState = () => {
    const labels = [];
    if (object.variables.locked !== undefined) {
      labels.push(object.variables.locked ? "🔒 鍵がかかっています" : "🔓 鍵は開いています");
    }
    if (object.variables.open !== undefined) {
      labels.push(object.variables.open ? "🚪 ドアが開いています" : "🚪 ドアは閉じています");
    }
    if (object.variables.items && object.variables.items.length > 0) {
      const itemNames = object.variables.items.map(id => {
        const item = objects.find(o => o.id === id);
        return item ? item.name : id;
      });
      labels.push(`📦 中身: ${itemNames.join(', ')}`);
    }
    return labels;
  };

  const actions = {
    Door: [
      { label: "鍵を開ける", code: "door.unlock" },
      { label: "扉を開く", code: "door.open" },
      { label: "扉を閉じる", code: "door.close" },
      { label: "鍵をかける", code: "door.lock" }
    ],
    Chest: [
      { label: "鍵を使って開ける", code: "chest.unlock(key)" },
      { label: "チェストを開く", code: "chest.open" }
    ],
    Key: [
      { label: "鍵を調べる", code: "key.inspect" }
    ]
  };

  const getSchematic = (className) => {
    const schematics = {
      Door: `class Door\n  def unlock\n    if @cursed\n      raise "Locked by curse"\n    end\n    @locked = false\n  end\nend`,
      Chest: `class Chest\n  def unlock(key)\n    if key.power > 0\n      @locked = false\n    end\n  end\nend`
    };
    return schematics[className] || "# No schematic available";
  };

  return (
    <div className="object-detail tactical-panel">
      <div className="detail-header">
        <h3>{object.name}</h3>
        <span className="class-tag">{object.class_name}</span>
      </div>
      
      <div className="beginner-guide">
        {getFriendlyState().map((label, i) => (
          <div key={i} className="status-label">{label}</div>
        ))}
      </div>

      <div className="action-section">
        <h4>Actions</h4>
        <div className="action-buttons">
          {(actions[object.class_name] || []).map(action => (
            <button 
              key={action.code} 
              onClick={() => onAction(action.code)}
              className="action-btn"
            >
              {action.label}
              <span className="action-code-hint">{action.code}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="schematic-section">
        <h4>Class Schematic <span className="mono-label">.rb source</span></h4>
        <pre className="schematic-code mono">
          {getSchematic(object.class_name)}
        </pre>
      </div>

      <div className="state-section">
        <h4>Technial State <span className="mono-label">@variables</span></h4>
        <div className="variables-list mono">
          {Object.entries(object.variables).map(([key, value]) => (
            <div key={key} className="variable-item">
              <span className="var-name">@{key}</span>
              <span className="var-operator">=</span>
              <span className={`var-value ${typeof value}`}>
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
