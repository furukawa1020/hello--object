import React from 'react';

const WorldView = ({ objects, onSelect, selectedId }) => {
  return (
    <div className="world-view tactical-panel">
      <div className="world-header">
        <h2>The First Room</h2>
      </div>
      <div className="scene">
        {objects.map(obj => (
          <div 
            key={obj.id} 
            className={`game-object ${obj.class_name.toLowerCase()} ${selectedId === obj.id ? 'selected' : ''}`}
            onClick={() => onSelect(obj)}
          >
            <div className="object-visual">
              {/* Specialized rendering for Door */}
              {obj.class_name === 'Door' && (
                <div className={`door-sprite ${obj.variables.open ? 'is-open' : ''} ${obj.variables.locked ? 'is-locked' : ''}`}>
                  <div className="door-knob"></div>
                </div>
              )}
              {obj.class_name === 'Chest' && (
                <div className={`chest-sprite ${obj.variables.locked ? 'is-locked' : ''}`}>
                  <div className="chest-latch"></div>
                </div>
              )}
              {obj.class_name === 'Key' && (
                <div className="key-sprite">
                  <div className="key-loop"></div>
                </div>
              )}
            </div>
            <div className="object-label">{obj.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldView;
