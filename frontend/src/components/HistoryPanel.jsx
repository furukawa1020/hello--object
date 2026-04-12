import React, { useRef } from 'react';

const typeInfo = (result, resultType) => {
  if (result === null || result === undefined) return { label: 'nil',     color: '#888' };
  if (resultType === 'TrueClass')  return { label: 'true',    color: '#ff993a' };
  if (resultType === 'FalseClass') return { label: 'false',   color: '#ff993a' };
  if (resultType === 'Integer')    return { label: 'Integer',  color: '#60d0ff' };
  if (resultType === 'Float')      return { label: 'Float',    color: '#60d0ff' };
  if (resultType === 'String')     return { label: 'String',   color: '#8aff80' };
  if (resultType === 'Array')      return { label: 'Array',    color: '#c8a0ff' };
  if (resultType === 'Hash')       return { label: 'Hash',     color: '#c8a0ff' };
  if (resultType === 'NilClass')   return { label: 'nil',      color: '#888' };
  return { label: resultType || 'Object', color: '#ffcc44' };
};

const formatResult = (result, resultType) => {
  if (result === null || result === undefined) return 'nil';
  if (typeof result === 'object' && result !== null) {
    if (result.name && result.class_name) return `#<${result.class_name} "${result.name}">`;
    if (Array.isArray(result)) return `[${result.map(r => JSON.stringify(r)).join(', ')}]`;
  }
  if (typeof result === 'string') {
    // Multi-line string: preserve newlines
    if (result.includes('\n')) return result;
    return `"${result}"`;
  }
  return JSON.stringify(result);
};

const isMultiLine = (result) =>
  typeof result === 'string' && result.includes('\n');

const HistoryPanel = ({ history, onRerun }) => {
  const listRef = useRef(null);

  return (
    <div className="history-panel tactical-panel">
      <div className="history-header">
        <span className="history-title">Execution Log</span>
        <span className="history-count">{history.length} entries</span>
      </div>
      <div className="history-list" ref={listRef}>
        {history.length === 0 && (
          <div className="history-empty">
            <span className="history-empty-icon">▸</span>
            コードを実行すると、ここに記録が残ります
          </div>
        )}
        {history.map((item, index) => {
          const { label, color } = typeInfo(item.result, item.resultType);
          const multiLine = isMultiLine(item.result);
          return (
            <div
              key={index}
              className={`history-item ${item.error ? 'error' : 'success'}`}
              title="クリックで再挿入"
            >
              <div className="history-meta">
                <span className="history-timestamp">{item.timestamp}</span>
                {!item.error && (
                  <span className="history-type" style={{ color }}>{label}</span>
                )}
                <button
                  className="history-rerun-btn"
                  onClick={() => onRerun?.(item.code)}
                  title="Magic Noteに挿入"
                >
                  ↺
                </button>
              </div>
              <div className="history-code mono">{item.code}</div>
              <div className="history-response">
                {item.error ? (
                  <div className="error-block">
                    <span className="error-icon">✗</span>
                    <span className="error-text">{item.error}</span>
                  </div>
                ) : multiLine ? (
                  <pre className="result-multiline mono" style={{ color }}>
                    {formatResult(item.result, item.resultType)}
                  </pre>
                ) : (
                  <div className="result-block">
                    <span className="result-arrow" style={{ color }}>=&gt;</span>
                    <span className="result-value mono" style={{ color }}>
                      {formatResult(item.result, item.resultType)}
                    </span>
                  </div>
                )}
              </div>
              {item.events && item.events.length > 0 && (
                <div className="history-events">
                  {item.events.map((ev, ei) => (
                    <span key={ei} className="event-tag">⚡ {ev.name}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPanel;
