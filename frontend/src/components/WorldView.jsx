import React, { useState } from 'react';
import { SCENE_MEMBERSHIP, SCENE_LABELS, SCENE_DESCRIPTIONS } from '../constants/scenes';

// ── Sprite components ─────────────────────────────────────
const DoorSprite = ({ obj }) => (
  <div className={['door-sprite', obj.variables.open ? 'is-open' : '',
    obj.variables.locked ? 'is-locked' : '', obj.variables.cursed ? 'is-cursed' : ''].filter(Boolean).join(' ')}>
    <div className="door-knob" />
    {obj.variables.cursed && <div className="curse-glyph">⛧</div>}
    {!obj.variables.locked && !obj.variables.cursed && !obj.variables.open && (
      <div className="door-unlocked-indicator" />
    )}
    {obj.variables.open && <div className="door-open-glow" />}
  </div>
);

const ChestSprite = ({ obj }) => (
  <div className={`chest-sprite ${obj.variables.locked ? 'is-locked' : 'is-unlocked'}`}>
    <div className="chest-latch" />
    {!obj.variables.locked && <div className="chest-open-lid" />}
  </div>
);

const KeySprite = () => (
  <div className="key-sprite">
    <div className="key-loop" />
    <div className="key-shaft" />
    <div className="key-teeth" />
  </div>
);

const TomeSprite = ({ obj }) => (
  <div className={`tome-sprite ${obj.variables.read ? 'is-read' : ''}`}>
    <div className="tome-pages" />
    {obj.variables.read && <div className="tome-glow" />}
  </div>
);

const NpcSprite = ({ obj }) => (
  <div className={`npc-sprite ${(obj.variables.talked_count || 0) > 0 ? 'has-talked' : ''}`}>
    <div className="npc-eye" />
    {(obj.variables.talked_count || 0) > 0 && <div className="npc-speech-dot" />}
  </div>
);

const MirrorSprite = ({ obj }) => (
  <div className={`mirror-sprite ${obj.variables.reflecting ? 'is-reflecting' : ''}`}>
    <div className="mirror-surface" />
    {obj.variables.reflecting && <div className="mirror-target-label">{obj.variables.reflecting}</div>}
  </div>
);

const PedestalSprite = ({ obj }) => (
  <div className={`pedestal-sprite ${obj.variables.activated ? 'is-activated' : ''}`}>
    <div className="pedestal-top" />
    {obj.variables.activated && <div className="pedestal-glow" />}
    {obj.variables.activated && <span className="pedestal-item-icon">🗝</span>}
  </div>
);

const WorldGateSprite = ({ obj }) => (
  <div className={`world-gate-sprite ${obj.variables.authorized ? 'gate-authorized' : ''}`} style={{ '--integrity': `${obj.variables.integrity}%` }}>
    <div className="gate-bars" />
    <div className="gate-integrity-bar" />
    {obj.variables.authorized && <div className="gate-auth-glow" />}
  </div>
);

const SPRITES = {
  Door: DoorSprite, Chest: ChestSprite, Key: KeySprite,
  Tome: TomeSprite, Npc: NpcSprite, Mirror: MirrorSprite, Pedestal: PedestalSprite,
  WorldGate: WorldGateSprite,
};

// ── Hover tooltip ─────────────────────────────────────────
const ObjectTooltip = ({ obj }) => (
  <div className="object-tooltip">
    <div className="tooltip-name">{obj.name}</div>
    <div className="tooltip-class">{obj.class_name}</div>
    <div className="tooltip-desc">{obj.description}</div>
    {obj.variables.cursed && (
      <div className="tooltip-warning">⛧ 呪われている</div>
    )}
  </div>
);

// ── Completion badge ──────────────────────────────────────
const isCompleted = (obj) => {
  const v = obj.variables;
  if (obj.class_name === 'Door')    return v.open;
  if (obj.class_name === 'Chest')   return !v.locked;
  if (obj.class_name === 'Tome')    return v.read;
  if (obj.class_name === 'Npc')     return (v.talked_count || 0) > 0;
  if (obj.class_name === 'Mirror')  return (v.reflection_count || 0) > 0;
  if (obj.class_name === 'Pedestal') return v.activated;
  if (obj.class_name === 'WorldGate') return v.open;
  return false;
};

// ── WorldView ─────────────────────────────────────────────
const WorldView = ({ objects, onSelect, selectedId }) => {
  const [activeScene, setActiveScene] = useState('the_first_room');
  const [hoveredId, setHoveredId]    = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const sceneIds = Object.keys(SCENE_LABELS);

  const sceneObjects = {};
  objects.forEach(obj => {
    const scene = SCENE_MEMBERSHIP[obj.id] || 'the_first_room';
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

  return (
    <div className="world-view tactical-panel">
      {/* Scene tabs */}
      <div className="world-header">
        <div className="scene-tabs">
          {sceneIds.map(sid => {
            const count     = (sceneObjects[sid] || []).length;
            const completed = (sceneObjects[sid] || []).filter(isCompleted).length;
            return (
              <button
                key={sid}
                className={`scene-tab ${activeScene === sid ? 'active' : ''}`}
                onClick={() => switchScene(sid)}
              >
                {SCENE_LABELS[sid]}
                <span className="scene-tab-count">
                  {completed}/{count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="scene-id-label">{SCENE_DESCRIPTIONS[activeScene]}</span>
      </div>

      {/* Objects + tooltip */}
      <div className={`scene ${transitioning ? 'transitioning' : ''}`}>
        {currentObjects.length === 0 && (
          <div className="scene-empty">このシーンにはまだオブジェクトがありません</div>
        )}
        {currentObjects.map(obj => {
          const Sprite    = SPRITES[obj.class_name];
          const isSelected = selectedId === obj.id;
          const done      = isCompleted(obj);
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
                {Sprite ? <Sprite obj={obj} /> : (
                  <div className="generic-sprite">{obj.class_name[0]}</div>
                )}
                {done && <div className="completion-check">✓</div>}
              </div>
              <div className="object-label-row">
                <span className="object-label">{obj.name}</span>
                <span className="object-class-mini">{obj.class_name}</span>
              </div>

              {/* Hover tooltip */}
              {hoveredId === obj.id && (
                <ObjectTooltip obj={obj} />
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
