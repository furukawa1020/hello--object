import React, { useRef, useEffect } from 'react';

// Determine the Ruby type label/color
const typeInfo = (result, resultType) => {
  if (result === null || result === undefined) return { label: 'nil', color: '#888' };
  if (resultType === 'TrueClass' || resultType === 'FalseClass') return { label: resultType.replace('Class', ''), color: '#ff993a' };
  if (resultType === 'Integer')  return { label: 'Integer', color: '#60d0ff' };
  if (resultType === 'Float')    return { label: 'Float',   color: '#60d0ff' };
  if (resultType === 'String')   return { label: 'String',  color: '#8aff80' };
  if (resultType === 'Array')    return { label: 'Array',   color: '#c8a0ff' };
  if (resultType === 'Hash')     return { label: 'Hash',    color: '#c8a0ff' };
  if (resultType === 'NilClass') return { label: 'nil',     color: '#888' };
  return { label: resultType || typeof result, color: '#ffcc44' };
};

const formatResult = (result, resultType) => {
  if (result === null || result === undefined) return 'nil';
  if (typeof result === 'object' && result.name) {
    // It's a serialized GameObject
    return `#<${result.class_name} name="${result.name}">`;
  }
  if (Array.isArray(result)) return `[${result.map(r => JSON.stringify(r)).join(', ')}]`;
  if (typeof result === 'string') return `"${result}"`;
  return JSON.stringify(result);
};

const HistoryPanel = ({ history }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [history.length]);

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
          return (
            <div key={index} className={`history-item ${item.error ? 'error' : 'success'}`}>
              <div className="history-meta">
                <span className="history-timestamp">{item.timestamp}</span>
                {!item.error && (
                  <span className="history-type" style={{ color }}>
                    {label}
                  </span>
                )}
              </div>
              <div className="history-code mono">{item.code}</div>
              <div className="history-response">
                {item.error ? (
                  <div className="error-block">
                    <span className="error-icon">✗</span>
                    <span className="error-text">{item.error}</span>
                  </div>
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
