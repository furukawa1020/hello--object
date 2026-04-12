import React from 'react';

/**
 * StatsBar — shows live execution statistics in the header area
 */
const StatsBar = ({ stats }) => {
  const { executions = 0, events = 0, objectsInteracted = 0, errors = 0 } = stats;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{executions}</span>
        <span className="stat-label">実行</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#ffcc44' }}>{events}</span>
        <span className="stat-label">イベント</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#60d0ff' }}>{objectsInteracted}</span>
        <span className="stat-label">操作済み</span>
      </div>
      {errors > 0 && (
        <>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#ff4444' }}>{errors}</span>
            <span className="stat-label">エラー</span>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsBar;
