import React, { useEffect, useRef } from 'react';

const EVENT_LABELS = {
  'door_unlocked':        { icon: '🔓', text: '扉の鍵が開いた', color: '#3aff8a' },
  'door_locked':          { icon: '🔒', text: '扉に鍵がかかった', color: '#ff993a' },
  'door_opened':          { icon: '🚪', text: '扉が開いた！',   color: '#3aff8a' },
  'chest_unlocked':       { icon: '🗝',  text: 'チェストが開錠された', color: '#3aff8a' },
  'chest_opened':         { icon: '📦', text: 'チェストが開いた', color: '#ffcc44' },
  'npc_talked':           { icon: '💬', text: '語りかけた',     color: '#60d0ff' },
  'tome_opened':          { icon: '📜', text: '古文書が読まれた', color: '#c8a0ff' },
  'mirror_reflected':     { icon: '🔮', text: '鏡が反射した',   color: '#c8a0ff' },
  'pedestal_activated':   { icon: '⚡', text: '台座が起動した！', color: '#ffcc44' },
  'object_revealed':      { icon: '✨', text: '新たなオブジェクトが現れた！', color: '#ff79c6' },
};

const EventLog = ({ events }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <div className="event-log tactical-panel">
      <div className="event-log-header">⚡ Event Stream</div>
      <div className="event-log-list">
        {events.map((ev, i) => {
          const meta = EVENT_LABELS[ev.name] || { icon: '◈', text: ev.name, color: '#888' };
          return (
            <div key={i} className="event-entry" style={{ '--ev-color': meta.color }}>
              <span className="event-icon">{meta.icon}</span>
              <span className="event-text" style={{ color: meta.color }}>{meta.text}</span>
              {ev.data?.object_id && (
                <span className="event-object-id">[ {ev.data.object_id} ]</span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default EventLog;
