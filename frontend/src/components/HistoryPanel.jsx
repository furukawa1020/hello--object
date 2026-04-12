import React from 'react';

const HistoryPanel = ({ history }) => {
  return (
    <div className="history-panel glass-panel">
      <h3>History</h3>
      <div className="history-list">
        {history.length === 0 && <p className="empty-msg">No conversations yet.</p>}
        {history.map((item, index) => (
          <div key={index} className={`history-item ${item.error ? 'error' : 'success'}`}>
            <div className="history-meta">
              <span className="timestamp">{item.timestamp}</span>
            </div>
            <div className="history-code mono">{item.code}</div>
            <div className="history-response">
              {item.error ? (
                <span className="error-text">! {item.error}</span>
              ) : (
                <span className="result-text">#=> {JSON.stringify(item.result)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
