import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple token-based syntax highlighter for Ruby
const highlight = (code) => {
  if (!code) return '';
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Strings
    .replace(/(["'])(.*?)\1/g, '<span class="hl-string">$1$2$1</span>')
    // Keywords
    .replace(/\b(class|def|end|if|else|elsif|unless|do|while|return|nil|true|false|self|super|raise|rescue|begin|module|include|extend|attr_reader|attr_writer|attr_accessor)\b/g, '<span class="hl-keyword">$1</span>')
    // Instance vars
    .replace(/(@\w+)/g, '<span class="hl-ivar">$1</span>')
    // Methods
    .replace(/\.(\w+)/g, '.<span class="hl-method">$1</span>')
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
    // Comments
    .replace(/(#[^\n]*)/g, '<span class="hl-comment">$1</span>');
};

const MagicNote = ({ onExecute, selectedObject, initialCode, onSaveToNotebook }) => {
  const [input, setInput]             = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [localHistory, setLocalHistory]   = useState([]);
  const [historyIdx, setHistoryIdx]   = useState(-1);
  const [showMethods, setShowMethods] = useState(false);
  const [objectMethods, setObjectMethods] = useState([]);
  const [methodFilter, setMethodFilter]   = useState('');
  const textareaRef = useRef(null);
  const mirrorRef   = useRef(null);

  // Sync initialCode from action buttons
  useEffect(() => {
    if (initialCode) {
      setInput(initialCode);
      textareaRef.current?.focus();
    }
  }, [initialCode]);

  // Fetch methods when object is selected
  useEffect(() => {
    if (!selectedObject) {
      setObjectMethods([]);
      return;
    }
    const name = selectedObject.id;
    fetch(`http://localhost:3000/methods?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setObjectMethods(data.methods);
      })
      .catch(() => {});
  }, [selectedObject?.id]);

  // Sync scrolling of mirror
  const syncScroll = () => {
    if (mirrorRef.current && textareaRef.current) {
      mirrorRef.current.scrollTop  = textareaRef.current.scrollTop;
      mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const code = input.trim();
    if (!code || isExecuting) return;

    setIsExecuting(true);
    setLocalHistory(prev => [code, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);

    await onExecute(code);
    setInput('');
    setIsExecuting(false);
    textareaRef.current?.focus();
  }, [input, isExecuting, onExecute]);

  const handleKeyDown = (e) => {
    // Ctrl+Enter = execute regardless of shift
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === 'ArrowUp' && localHistory.length > 0 && e.ctrlKey) {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, localHistory.length - 1);
      setHistoryIdx(nextIdx);
      setInput(localHistory[nextIdx]);
      return;
    }
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx < 0) { setHistoryIdx(-1); setInput(''); }
      else { setHistoryIdx(nextIdx); setInput(localHistory[nextIdx]); }
      return;
    }
    // Ctrl+S = save snippet
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (input.trim() && onSaveToNotebook) onSaveToNotebook(input.trim());
      return;
    }
    // Tab = insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newVal = input.slice(0, selectionStart) + '  ' + input.slice(selectionEnd);
      setInput(newVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 2;
          textareaRef.current.selectionEnd   = selectionStart + 2;
        }
      }, 0);
    }
  };

  const insertMethod = (method) => {
    const alias = selectedObject?.id.split('_')[0] || '';
    const snippet = `${alias}.${method}`;
    setInput(snippet);
    setShowMethods(false);
    textareaRef.current?.focus();
  };

  const filteredMethods = objectMethods.filter(m =>
    m.toLowerCase().includes(methodFilter.toLowerCase())
  );

  return (
    <div className="magic-note tactical-panel">
      <div className="note-header">
        <span className="note-title">✦ Magic Note</span>
        <div className="note-controls">
          {selectedObject && objectMethods.length > 0 && (
            <button
              className={`methods-btn ${showMethods ? 'active' : ''}`}
              onClick={() => setShowMethods(s => !s)}
              title="メソッド一覧"
            >
              ⌘ {selectedObject.class_name}.methods
            </button>
          )}
          {input.trim() && onSaveToNotebook && (
            <button
              className="save-snippet-btn"
              onClick={() => onSaveToNotebook(input.trim())}
              title="Ctrl+S でも保存"
            >
              📓 保存
            </button>
          )}
        </div>
      </div>

      {/* Method palette */}
      {showMethods && (
        <div className="method-palette">
          <input
            className="method-filter mono"
            placeholder="メソッドを絞り込む..."
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            autoFocus
          />
          <div className="method-list">
            {filteredMethods.map(m => (
              <button key={m} className="method-chip" onClick={() => insertMethod(m)}>
                .{m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Syntax-highlighted mirror layer */}
      <div className="editor-wrapper">
        <div
          ref={mirrorRef}
          className="editor-mirror mono"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlight(input) + '\n' }}
        />
        <textarea
          ref={textareaRef}
          className="editor-textarea mono"
          value={input}
          onChange={e => { setInput(e.target.value); syncScroll(); }}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          placeholder={"オブジェクトに話しかけてみよう...\n例: door.unlock\n例: class Door; def unlock; @locked=false; end; end\n\n↑ Ctrl+↑↓ 履歴  |  Tab インデント  |  Ctrl+S 保存"}
          disabled={isExecuting}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="note-footer">
        <div className="keyboard-hints">
          <kbd>Enter</kbd> 実行
          <kbd>Shift+Enter</kbd> 改行
          <kbd>Tab</kbd> インデント
          <kbd>Ctrl+↑</kbd> 履歴
        </div>
        <button
          type="button"
          className={`button-tactical ${isExecuting ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={isExecuting}
        >
          {isExecuting ? '⟳ 実行中...' : 'Execute ⏎'}
        </button>
      </div>
    </div>
  );
};

export default MagicNote;
