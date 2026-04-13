import React, { useState, useEffect } from 'react';

// Alias used in the ruby evaluator registry
const idAlias = (obj) => obj.alias_name || obj.id;

// Action templates per class (DEPRECATED - Moved to Ruby Backend)
const ACTIONS = {};

// Friendly state labels
// ... (getFriendlyState remains for UI flavor)

// Class schematic snippets (DEPRECATED - Moved to Ruby Backend)
const SCHEMATICS = {};

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

  const actions = object.actions || [];
  const stateLabels = object.labels || [];
  const schematic = object.schematic;
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
          <h4 className="label-tech">Actions</h4>
          <div className="action-buttons">
            {actions.map(action => (
              <button
                key={action.code}
                onClick={() => onAction(action.code)}
                className={`action-btn ${action.disabled ? 'disabled' : ''}`}
                disabled={action.disabled}
              >
                <span className="action-label">{action.label}</span>
                <span className="action-code-hint mono">{action.code}</span>
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
