import React, { useState } from 'react';
import { SCENE_MEMBERSHIP, SCENE_LABELS, SCENE_DESCRIPTIONS } from '../constants/scenes';

// ── Sprite components ─────────────────────────────────────
const DoorSprite = ({ obj }) => (
  <div className={[
    'door-sprite',
    obj.variables.open ? 'is-open' : '',
    obj.variables.locked ? 'is-locked' : '',
    obj.variables.cursed ? 'is-cursed' : '',
  ].filter(Boolean).join(' ')}>
    <div className="door-knob" />
    {obj.variables.cursed && <div className="curse-glyph">⛧</div>}
    {!obj.variables.locked && !obj.variables.open && <div className="door-unlocked-indicator" />}
  </div>
);

const ChestSprite = ({ obj }) => (
  <div className={`chest-sprite ${obj.variables.locked ? 'is-locked' : 'is-open'}`}>
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
  <div className={`npc-sprite ${obj.variables.talked_count > 0 ? 'has-talked' : ''}`}>
    <div className="npc-eye" />
    {obj.variables.talked_count > 0 && <div className="npc-speech-dot" />}
  </div>
);

const MirrorSprite = ({ obj }) => (
  <div className={`mirror-sprite ${obj.variables.reflecting ? 'is-reflecting' : ''}`}>
    <div className="mirror-surface" />
  </div>
);

const PedestalSprite = ({ obj }) => (
  <div className={`pedestal-sprite ${obj.variables.activated ? 'is-activated' : ''}`}>
    <div className="pedestal-top" />
    {obj.variables.activated && <div className="pedestal-glow" />}
  </div>
);

const SPRITES = { Door: DoorSprite, Chest: ChestSprite, Key: KeySprite, Tome: TomeSprite, Npc: NpcSprite, Mirror: MirrorSprite, Pedestal: PedestalSprite };

// ── Interaction count badge ───────────────────────────────
const InteractionBadge = ({ obj }) => {
  const count = obj.variables.talked_count || obj.variables.reflection_count || null;
  if (!count) return null;
  return <div className="interaction-badge">{count}</div>;
};

// ── WorldView ─────────────────────────────────────────────
const WorldView = ({ objects, onSelect, selectedId }) => {
  const [activeScene, setActiveScene] = useState('the_first_room');

  const sceneIds = Object.keys(SCENE_LABELS);

  const sceneObjects = {};
  objects.forEach(obj => {
    const scene = SCENE_MEMBERSHIP[obj.id] || 'the_first_room';
    if (!sceneObjects[scene]) sceneObjects[scene] = [];
    sceneObjects[scene].push(obj);
  });

  const currentObjects = sceneObjects[activeScene] || [];

  return (
    <div className="world-view tactical-panel">
      {/* Scene tabs */}
      <div className="world-header">
        <div className="scene-tabs">
          {sceneIds.map(sid => {
            const count = (sceneObjects[sid] || []).length;
            return (
              <button
                key={sid}
                className={`scene-tab ${activeScene === sid ? 'active' : ''}`}
                onClick={() => setActiveScene(sid)}
              >
                {SCENE_LABELS[sid]}
                <span className="scene-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
        <span className="scene-id-label">{SCENE_DESCRIPTIONS[activeScene]}</span>
      </div>

      {/* Objects */}
      <div className="scene">
        {currentObjects.length === 0 && (
          <div className="scene-empty">このシーンにはまだオブジェクトがありません</div>
        )}
        {currentObjects.map(obj => {
          const Sprite = SPRITES[obj.class_name];
          const isSelected = selectedId === obj.id;
          return (
            <div
              key={obj.id}
              className={[
                'game-object',
                obj.class_name.toLowerCase(),
                isSelected ? 'selected' : '',
                obj.variables.cursed ? 'cursed' : '',
                obj.variables.activated ? 'activated' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(obj)}
              title={`${obj.name} (${obj.class_name})`}
            >
              <div className="object-visual">
                {Sprite ? <Sprite obj={obj} /> : (
                  <div className="generic-sprite">{obj.class_name[0]}</div>
                )}
                <InteractionBadge obj={obj} />
              </div>
              <div className="object-label-row">
                <span className="object-label">{obj.name}</span>
                <span className="object-class-mini">{obj.class_name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldView;
