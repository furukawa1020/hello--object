import React, { useState } from 'react';

// ── Hover tooltip ─────────────────────────────────────────
const ObjectTooltip = ({ tooltip }) => {
  if (!tooltip) return null;
  return (
    <div className="object-tooltip">
      <div className="tooltip-name">{tooltip.name}</div>
      <div className="tooltip-class">{tooltip.class_name}</div>
      <div className="tooltip-desc">{tooltip.description}</div>
      {tooltip.warning && (
        <div className="tooltip-warning">{tooltip.warning}</div>
      )}
    </div>
  );
};

// ── WorldView ─────────────────────────────────────────────
const WorldView = ({ objects, scenes, onSelect, selectedId }) => {
  const [activeScene, setActiveScene] = useState(null);
  const [hoveredId, setHoveredId]    = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Initialize activeScene once scenes are loaded
  React.useEffect(() => {
    if (scenes.length > 0 && !activeScene) {
      setActiveScene(scenes[0].id);
    }
  }, [scenes, activeScene]);

  const sceneObjects = {};
  objects.forEach(obj => {
    // Priority 1: Object's own scene_id from backend
    // Priority 2: Fallback to first scene
    const scene = obj.scene_id || (scenes[0]?.id || 'default');
    if (!sceneObjects[scene]) sceneObjects[scene] = [];
    sceneObjects[scene].push(obj);
  });

  const switchScene = (sid) => {
    if (sid === activeScene) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveScene(sid);
      setTransitioning(false);
    }, 200);
  };

  const currentObjects = sceneObjects[activeScene] || [];
  const hoveredObj    = objects.find(o => o.id === hoveredId);
  const activeSceneData = scenes.find(s => s.id === activeScene) || {};

  return (
    <div className="world-view tactical-panel">
      {/* Scene tabs */}
      <div className="world-header">
        <div className="scene-tabs">
          {scenes.map(s => {
            const currentSceneObjects = sceneObjects[s.id] || [];
            const count     = currentSceneObjects.length;
            const completed = currentSceneObjects.filter(o => o.completed).length;
            return (
              <button
                key={s.id}
                className={`scene-tab ${activeScene === s.id ? 'active' : ''}`}
                onClick={() => switchScene(s.id)}
              >
                {s.label}
                <span className="scene-tab-count">
                  {completed}/{count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="scene-id-label">{activeSceneData.description}</span>
      </div>

      {/* Objects + tooltip */}
      <div className={`scene ${transitioning ? 'transitioning' : ''}`}>
        {currentObjects.length === 0 && (
          <div className="scene-empty">このシーンにはまだオブジェクトがありません</div>
        )}
        {currentObjects.map(obj => {
          const isSelected = selectedId === obj.id;
          const done       = obj.completed;
          
          return (
            <div
              key={obj.id}
              className={['game-object', obj.class_name.toLowerCase(),
                isSelected ? 'selected' : '',
                obj.variables.cursed ? 'cursed' : '',
                obj.variables.activated ? 'activated' : '',
                done ? 'completed' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(obj)}
              onMouseEnter={() => setHoveredId(obj.id)}
              onMouseLeave={() => setHoveredId(null)}
              title=""
            >
              <div className="object-visual">
                <div 
                  className="sprite-container"
                  dangerouslySetInnerHTML={{ __html: obj.sprite }} 
                />
                {done && <div className="completion-check">✓</div>}
              </div>
              <div className="object-label-row">
                <span className="object-label">{obj.name}</span>
                <span className="object-class-mini">{obj.class_name}</span>
              </div>

              {/* Hover tooltip */}
              {hoveredId === obj.id && (
                <ObjectTooltip tooltip={obj.tooltip} />
              )}
            </div>
          );
        })}
      </div>

      {/* Keyboard hint overlay */}
      <div className="world-kb-hints">
        <span><kbd>I</kbd> inspect</span>
        <span><kbd>T</kbd> talk</span>
        <span><kbd>E</kbd> read</span>
        <span><kbd>R</kbd> reflect</span>
        <span><kbd>/</kbd> focus</span>
      </div>
    </div>
  );
};

export default WorldView;
