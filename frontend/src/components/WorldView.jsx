import React, { useState } from 'react';

// Object type → icon/sprite mapping
const SPRITES = {
  Door: ({ obj }) => (
    <div className={`door-sprite ${obj.variables.open ? 'is-open' : ''} ${obj.variables.locked ? 'is-locked' : ''} ${obj.variables.cursed ? 'is-cursed' : ''}`}>
      <div className="door-knob"></div>
      {obj.variables.cursed && <div className="curse-glyph">⛧</div>}
    </div>
  ),
  Chest: ({ obj }) => (
    <div className={`chest-sprite ${obj.variables.locked ? 'is-locked' : ''}`}>
      <div className="chest-latch"></div>
    </div>
  ),
  Key: () => (
    <div className="key-sprite">
      <div className="key-loop"></div>
    </div>
  ),
  Tome: ({ obj }) => (
    <div className={`tome-sprite ${obj.variables.read ? 'is-read' : ''}`}>
      <div className="tome-pages"></div>
    </div>
  ),
  Npc: () => (
    <div className="npc-sprite">
      <div className="npc-eye"></div>
    </div>
  ),
};

// Group objects by their scene
const SCENE_MEMBERSHIP = {
  door_001:    'the_first_room',
  chest_001:   'the_first_room',
  key_001:     'the_first_room',
  tome_001:    'the_first_room',
  sage_001:    'the_first_room',
  cursed_door: 'the_sealed_chamber',
  tome_002:    'the_sealed_chamber',
};

const SCENE_LABELS = {
  the_first_room:      '第一の間',
  the_sealed_chamber:  '封印の間',
};

const WorldView = ({ objects, onSelect, selectedId }) => {
  const [activeScene, setActiveScene] = useState('the_first_room');

  // Group
  const scenes = {};
  objects.forEach(obj => {
    const scene = SCENE_MEMBERSHIP[obj.id] || 'the_first_room';
    if (!scenes[scene]) scenes[scene] = [];
    scenes[scene].push(obj);
  });

  const sceneIds = Object.keys(SCENE_LABELS);

  return (
    <div className="world-view tactical-panel">
      <div className="world-header">
        <div className="scene-tabs">
          {sceneIds.map(sid => (
            <button
              key={sid}
              className={`scene-tab ${activeScene === sid ? 'active' : ''}`}
              onClick={() => setActiveScene(sid)}
            >
              {SCENE_LABELS[sid]}
            </button>
          ))}
        </div>
        <span className="scene-id-label">SCENE :: {activeScene}</span>
      </div>

      <div className="scene">
        {(scenes[activeScene] || []).map(obj => {
          const Sprite = SPRITES[obj.class_name];
          return (
            <div
              key={obj.id}
              className={`game-object ${obj.class_name.toLowerCase()} ${selectedId === obj.id ? 'selected' : ''}`}
              onClick={() => onSelect(obj)}
            >
              <div className="object-visual">
                {Sprite ? <Sprite obj={obj} /> : <div className="generic-sprite">{obj.class_name[0]}</div>}
              </div>
              <div className="object-label">{obj.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldView;
