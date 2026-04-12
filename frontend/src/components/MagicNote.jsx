import React, { useState, useEffect, useRef } from 'react';

const MagicNote = ({ onExecute, selectedObject, initialCode, onSaveToNotebook }) => {
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialCode) {
      setInput(initialCode);
      textareaRef.current?.focus();
    }
  }, [initialCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = input.trim();
    if (!code) return;

    setIsExecuting(true);
    setHistory(prev => [code, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);

    await onExecute(code);
    setInput('');
    setIsExecuting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    // Arrow up/down for history
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx < 0) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    }
  };

  return (
    <div className="magic-note tactical-panel">
      <div className="note-header">
        <span className="note-title">✦ Magic Note</span>
        <div className="note-controls">
          {input.trim() && onSaveToNotebook && (
            <button
              className="save-snippet-btn"
              onClick={() => onSaveToNotebook(input.trim())}
              title="ノートブックに保存"
            >
              📓 保存
            </button>
          )}
          <span className="history-hint">↑↓ 履歴</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"オブジェクトに話しかけてみよう...\n例: door.unlock\n例: class Door; def unlock; @locked=false; end; end"}
          className="mono"
          disabled={isExecuting}
          autoFocus
        />
        <div className="note-footer">
          <span className="keyboard-hint">Enter で実行 / Shift+Enter で改行</span>
          <button type="submit" className={`button-tactical ${isExecuting ? 'loading' : ''}`} disabled={isExecuting}>
            {isExecuting ? '実行中...' : 'Execute ⏎'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MagicNote;
