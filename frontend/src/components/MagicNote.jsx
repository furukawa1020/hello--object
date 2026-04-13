import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodeAnalyzer from './CodeAnalyzer';

const highlight = (code) => {
  if (!code) return '';
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(["'])(.*?)\1/g, '<span class="hl-string">$1$2$1</span>')
    .replace(/\b(class|def|end|if|else|elsif|unless|do|while|return|nil|true|false|self|super|raise|rescue|begin|module|include|extend|attr_reader|attr_writer|attr_accessor)\b/g, '<span class="hl-keyword">$1</span>')
    .replace(/(@\w+)/g, '<span class="hl-ivar">$1</span>')
    .replace(/\.(\w+)/g, '.<span class="hl-method">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
    .replace(/(#[^\n]*)/g, '<span class="hl-comment">$1</span>');
};

const MagicNote = ({ onExecute, selectedObject, initialCode, onSaveToNotebook }) => {
  const [input, setInput]               = useState('');
  const [analysis, setAnalysis]         = useState(null);
  const [isExecuting, setIsExecuting]   = useState(false);
  const [localHistory, setLocalHistory] = useState([]);
  const [historyIdx, setHistoryIdx]     = useState(-1);
  const [showMethods, setShowMethods]   = useState(false);
  const [objectMethods, setObjectMethods] = useState([]);
  const [methodFilter, setMethodFilter] = useState('');
  const textareaRef = useRef(null);
  const mirrorRef   = useRef(null);

  useEffect(() => {
    if (initialCode) {
      setInput(initialCode);
      textareaRef.current?.focus();
    }
  }, [initialCode]);

  useEffect(() => {
    if (!input.trim()) { setAnalysis(null); return; }
    const timer = setTimeout(() => {
      fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input })
      })
      .then(r => r.json())
      .then(data => setAnalysis(data.analysis))
      .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!selectedObject) { setObjectMethods([]); return; }
    fetch(`http://localhost:3000/methods?name=${encodeURIComponent(selectedObject.id)}`)
      .then(r => r.json())
      .then(data => { if (data.success) setObjectMethods(data.methods); })
      .catch(() => {});
  }, [selectedObject?.id]);

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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); handleSubmit(); return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); handleSubmit(); return;
    }
    if (e.key === 'ArrowUp' && e.ctrlKey && localHistory.length > 0) {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, localHistory.length - 1);
      setHistoryIdx(next); setInput(localHistory[next]); return;
    }
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      const next = historyIdx - 1;
      if (next < 0) { setHistoryIdx(-1); setInput(''); }
      else { setHistoryIdx(next); setInput(localHistory[next]); }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (input.trim() && onSaveToNotebook) onSaveToNotebook(input.trim());
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: ss, selectionEnd: se } = e.target;
      setInput(input.slice(0, ss) + '  ' + input.slice(se));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = ss + 2;
          textareaRef.current.selectionEnd   = ss + 2;
        }
      }, 0);
    }
  };

  const insertMethod = (method) => {
    const prefix = selectedObject?.id.replace(/_\d+$/, '') || '';
    setInput(`${prefix}.${method}`);
    setShowMethods(false);
    textareaRef.current?.focus();
  };

  const filteredMethods = objectMethods.filter(m =>
    m.toLowerCase().includes(methodFilter.toLowerCase())
  );

  // Detect if code is multi-line (class/def block)
  const isBlock = input.includes('\n') || /\b(class|def|module)\b/.test(input);

  return (
    <div className={`magic-note tactical-panel ${isBlock ? 'is-block-mode' : ''}`}>
      <div className="note-header">
        <div className="note-title-area">
          <span className="note-title">✦ Magic Note</span>
          {analysis && (
            <div className="code-analyzer-badge" style={{ '--badge-color': analysis.color }}>
              {analysis.label}
            </div>
          )}
        </div>
        <div className="note-controls">
          {selectedObject && objectMethods.length > 0 && (
            <button
              className={`methods-btn ${showMethods ? 'active' : ''}`}
              onClick={() => setShowMethods(s => !s)}
            >
              ⌘ {selectedObject.class_name}
            </button>
          )}
          {input.trim() && onSaveToNotebook && (
            <button className="save-snippet-btn" onClick={() => onSaveToNotebook(input.trim())}>
              📓
            </button>
          )}
        </div>
      </div>

      {showMethods && (
        <div className="method-palette">
          <input
            className="method-filter mono"
            placeholder="絞り込む..."
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            autoFocus
          />
          <div className="method-list">
            {filteredMethods.map(m => (
              <button key={m} className="method-chip" onClick={() => insertMethod(m)}>.{m}</button>
            ))}
          </div>
        </div>
      )}

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
          placeholder={"例: door.unlock\n\n# クラスを書き換えるには:\nclass Door\n  def unlock\n    @locked = false\n  end\nend"}
          disabled={isExecuting}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="note-footer">
        <div className="keyboard-hints">
          <kbd>Enter</kbd> 実行
          <kbd>Shift+↵</kbd> 改行
          <kbd>Tab</kbd> インデント
          <kbd>Ctrl+↑</kbd> 履歴
          <kbd>Ctrl+S</kbd> 保存
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
