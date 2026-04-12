import React from 'react';

const ObjectDetail = ({ object }) => {
  if (!object) {
    return (
      <div className="object-detail glass-panel empty">
        <p>オブジェクトを選択してください</p>
      </div>
    );
  }

  return (
    <div className="object-detail glass-panel">
      <div className="detail-header">
        <h3>{object.name}</h3>
        <span className="class-tag">{object.class_name}</span>
      </div>
      <p className="description">{object.description}</p>
      
      <div className="state-section">
        <h4>Internal State <span className="mono-label">@variables</span></h4>
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
