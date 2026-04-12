import React, { useState } from 'react';

/**
 * Notebook — ユーザーがコードスニペットを保存・管理できる機能
 * Phase 9 の核心機能
 */
const Notebook = ({ onInsert }) => {
  const [entries, setEntries] = useState([]);
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const save = () => {
    if (!code.trim()) return;
    const entry = {
      id: Date.now(),
      label: label.trim() || code.slice(0, 20) + '...',
      code: code.trim(),
    };
    setEntries(prev => [entry, ...prev]);
    setLabel('');
    setCode('');
  };

  const remove = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className={`notebook tactical-panel ${isOpen ? 'open' : ''}`}>
      <button className="notebook-toggle" onClick={() => setIsOpen(s => !s)}>
        <span>📓 ノートブック</span>
        <span className="notebook-count">{entries.length}</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="notebook-body">
          {/* Save new snippet */}
          <div className="notebook-save">
            <input
              className="notebook-label-input mono"
              placeholder="メモ名（省略可）"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
            <textarea
              className="notebook-code-input mono"
              placeholder="保存したいコードを貼り付け..."
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={3}
            />
            <button onClick={save} className="button-tactical small">保存</button>
          </div>

          {/* List */}
          {entries.length === 0 && (
            <p className="notebook-empty">まだスニペットがありません。</p>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="notebook-entry">
              <div className="notebook-entry-header">
                <span className="notebook-entry-label">{entry.label}</span>
                <div className="notebook-entry-actions">
                  <button onClick={() => onInsert(entry.code)} className="nb-btn insert">挿入</button>
                  <button onClick={() => remove(entry.id)} className="nb-btn remove">削除</button>
                </div>
              </div>
              <pre className="notebook-entry-code mono">{entry.code}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notebook;
