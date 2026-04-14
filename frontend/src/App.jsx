import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import MagicNote from './components/MagicNote';
import WorldView from './components/WorldView';
import Onboarding from './components/Onboarding';
import VictoryScreen from './components/VictoryScreen';
import useLocalStorage from './hooks/useLocalStorage';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { sounds, eventSound } from './utils/sounds';
import ToastSystem from './components/ToastSystem';

const isVictory = (objects) => {
  const d = objects.find(o => o.id === 'cursed_door');
  return d && d.variables.open === true;
};

function App() {
  const [objects, setObjects]               = useState([]);
  const [scenes, setScenes]                 = useState([]);
  const [tutorial, setTutorial]             = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory]               = useState([]);
  const [allEvents, setAllEvents]           = useState([]);
  const [naviMessage, setNaviMessage]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [lastExecution, setLastExecution]   = useState({ result: null, error: null });
  const [actionCode, setActionCode]         = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notebookCode, setNotebookCode]     = useState('');
  const [showVictory, setShowVictory]       = useState(false);
  const [notebookEntries, setNotebookEntries] = useState([]);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [stats, setStats]                   = useState({ executions: 0, events: 0, objectsInteracted: new Set(), errors: 0 });
  const [instability, setInstability]       = useState(0);
  const [isNaviMinimized, setIsNaviMinimized] = useState(false);
  const magicNoteRef = useRef(null);
  const toastRef = useRef(null);
  const storage = useLocalStorage();

  // Restore persisted data on mount
  useEffect(() => {
    fetchState();
    const saved = storage.load();
    if (saved) {
      if (saved.history) setHistory(saved.history.slice(0, 30));
    }
    if (!localStorage.getItem('hasSeenOnboarding')) setShowOnboarding(true);
  }, []);

  // Persist history on change
  useEffect(() => {
    if (history.length > 0) {
      storage.save({ history: history.slice(0, 30) });
    }
  }, [history]);

  const fetchState = async () => {
    try {
      const r = await fetch('/state');
      const data = await r.json();
      if (data.success) {
        setObjects(data.objects);
        if (data.scenes) setScenes(data.scenes);
        if (data.tutorial) setTutorial(data.tutorial);
        if (data.is_victory) setShowVictory(true);
        if (data.navi_message) setNaviMessage(data.navi_message);
      }
    } catch (e) { console.error('fetchState failed', e); }
    finally { setLoading(false); }
  };

  const handleExecute = useCallback(async (code) => {
    try {
      const r = await fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();

      setLastExecution({ result: data.result, error: data.error });
      setActionCode('');

      // Sound
      if (data.error) {
        sounds.error();
      } else if (data.events?.length > 0) {
        data.events.forEach(ev => eventSound(ev.name));
      } else {
        sounds.success();
      }

      // Accumulate events
      if (data.events?.length > 0) {
        setAllEvents(prev => [...prev, ...data.events].slice(-60));
      }

      // Stats
      setStats(prev => {
        const interacted = new Set(prev.objectsInteracted);
        if (selectedObject) interacted.add(selectedObject.id);
        return {
          executions:       prev.executions + 1,
          events:           prev.events + (data.events?.length || 0),
          objectsInteracted: interacted,
          errors:           prev.errors + (data.error ? 1 : 0),
        };
      });

      setHistory(prev => [{
        code,
        result: data.result,
        formattedResult: data.formatted_result,
        resultType: data.result_type,
        resultColor: data.result_color,
        events: data.events,
        error: data.error,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 49));

      if (data.objects) {
        setObjects(data.objects);
        if (selectedObject) {
          const updated = data.objects.find(o => o.id === selectedObject.id);
          if (updated) setSelectedObject(updated);
        }
      }

      if (data.instability !== undefined) {
        setInstability(data.instability);
        if (data.instability > 20) {
          toastRef.current?.add('システム整合性が低下しています。グリッチに注意してください。', 'warning');
        }
      }

      // Backend achievements
      if (data.achievements?.length > 0) {
        data.achievements.forEach(ach => {
          if (!localStorage.getItem(ach.id)) {
            toastRef.current?.add(`Achievement: ${ach.title}`, 'achievement');
            localStorage.setItem(ach.id, 'true');
          }
        });
      }

      if (data.scenes) {
        setScenes(data.scenes);
      }

      if (data.tutorial) {
        setTutorial(data.tutorial);
      }

      if (data.is_victory) {
        setShowVictory(true);
      }

      if (data.navi_message) {
        setNaviMessage(data.navi_message);
      }
    } catch (e) {
      console.error('execute failed', e);
      sounds.error();
      setLastExecution({ result: null, error: 'Network Error: サーバーに接続できませんでした。' });
    }
  }, [selectedObject, showVictory]);

  const handleReset = async () => {
    if (!window.confirm('世界をリセットして、すべての変更を元に戻します。よろしいですか？')) return;
    sounds.reset();
    try {
      const r = await fetch('/reset', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setObjects(data.objects);
        setHistory([]);
        setAllEvents([]);
        setSelectedObject(null);
        setLastExecution({ result: null, error: null });
        setShowVictory(false);
        setStats({ executions: 0, events: 0, objectsInteracted: new Set(), errors: 0 });
        setInstability(0);
        storage.clear();
        localStorage.removeItem('ach_monkey');
        localStorage.removeItem('ach_singleton');
      }
    } catch (e) { console.error('reset failed', e); }
  };

  const handleSelectObject = (obj) => {
    sounds.select();
    setSelectedObject(obj);
  };

  const handleSaveToNotebook = (code) => {
    if (!code) return;
    const entry = {
      id: Date.now(),
      label: code.slice(0, 24) + (code.length > 24 ? '…' : ''),
      code,
    };
    setNotebookEntries(prev => [entry, ...prev]);
    setIsNotebookOpen(true);
    toastRef.current?.add('Note recorded.', 'success');
  };

  const handleExportJourney = () => {
    const script = history.map(h => `# ${h.timestamp}\n${h.code}${h.error ? ' # Error: ' + h.error : ''}`).reverse().join('\n\n');
    const header = `# hello, object Journey Export\n# Executions: ${stats.executions}\n# Events: ${stats.events}\n\n`;
    navigator.clipboard.writeText(header + script);
    alert('ジャーニーをクリップボードにコピーしました！');
  };

  // ── Keyboard shortcut helpers ─────────────────────────
  const getAlias = (obj) => {
    const map = {
      door_001: 'door', chest_001: 'chest', key_001: 'key',
      tome_001: 'tome', sage_001: 'sage', mirror_001: 'mirror',
      cursed_door: 'cursed_door', tome_002: 'forbidden_tome',
      warlock_001: 'warlock', pedestal_001: 'pedestal',
      tome_sealed: 'tome_sealed', mirror_002: 'mirror_002',
      librarian_001: 'librarian', gate_exit: 'gate',
      gatekeeper_001: 'gatekeeper',
    };
    return map[obj?.id] || obj?.id;
  };

  const shortcuts = useCallback({
    onInspect: () => {
      if (!selectedObject) return;
      setActionCode(`mirror.reflect(${getAlias(selectedObject)})`);
    },
    onReflect: () => {
      if (!selectedObject) return;
      setActionCode(`mirror.reflect(${getAlias(selectedObject)})`);
    },
    onTalk: () => {
      if (selectedObject?.class_name === 'Npc') {
        const a = getAlias(selectedObject);
        setActionCode(`${a}.talk`);
      }
    },
    onRead: () => {
      if (selectedObject?.class_name === 'Tome') {
        const a = getAlias(selectedObject);
        setActionCode(`${a}.read`);
      }
    },
    onFocusInput: () => {
      document.querySelector('.editor-textarea')?.focus();
    },
    onEscape: () => {
      setShowVictory(false);
      setShowOnboarding(false);
    },
  }, [selectedObject]);

  useKeyboardShortcuts(shortcuts);

  const statsDisplay = { ...stats, objectsInteracted: stats.objectsInteracted.size };
  const glitchLevel = Math.min(Math.floor(instability / 10), 5);

  return (
    <div className={`app-container instability-level-${glitchLevel}`}>
      <div className="ui-corner top-left" />
      <div className="ui-corner top-right" />
      <div className="ui-corner bottom-left" />
      <div className="ui-corner bottom-right" />

      <header className="app-header">
        <div className="app-brand">
          <h1>hello, <span className="brand-accent">object</span></h1>
          <span className="app-subtitle">Ruby Interactive World</span>
        </div>
        <div className="stats-bar">
          <span>Executions: {statsDisplay.executions}</span>
          <span>Events: {statsDisplay.events}</span>
          <span>Interacted: {statsDisplay.objectsInteracted}</span>
          <span>Errors: {statsDisplay.errors}</span>
        </div>
        <div className="header-actions">
          <button onClick={handleExportJourney} className="export-btn">⎙ Export Journey</button>
          <button onClick={handleReset} className="reset-btn">⟳ Reset</button>
          <div className="status-badge">
            <span className="status-dot" />
            Ruby 4.0.0 Engine
          </div>
        </div>
      </header>

      <main className="main-layout">
        <div className="left-column">
          <WorldView
            objects={objects}
            scenes={scenes}
            onSelect={handleSelectObject}
            selectedId={selectedObject?.id}
          />
          <MagicNote
            ref={magicNoteRef}
            onExecute={handleExecute}
            selectedObject={selectedObject}
            initialCode={actionCode}
            onSaveToNotebook={handleSaveToNotebook}
          />
        </div>

        <aside className="right-sidebar">
          {selectedObject ? (
            <div className="object-detail tactical-panel">
              <div className="detail-header">
                <h3>{selectedObject.name}</h3>
                <span className="class-tag">{selectedObject.class_name}</span>
              </div>
              <p className="detail-description">{selectedObject.description}</p>
              
              <div className="status-labels">
                {selectedObject.labels?.map((l, i) => (
                  <div key={i} className={`status-label level-${l.level}`}>
                    <span className="status-icon">{l.icon}</span> {l.text}
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                {selectedObject.actions?.map((a, i) => (
                  <button key={i} className="action-btn" onClick={() => setActionCode(a.code)} disabled={a.disabled}>
                    <span className="action-label">{a.label}</span>
                    <span className="action-code-hint">{a.code}</span>
                  </button>
                ))}
              </div>

              {selectedObject.schematic && (
                <div className="schematic-section">
                  <h4>Class Schematic</h4>
                  <pre className="schematic-code">{selectedObject.schematic}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="detail-empty tactical-panel">
              <p>Observe the world to extract its essence.</p>
            </div>
          )}
          
          {/* Consolidated Notebook */}
          <div className={`notebook-compact tactical-panel ${isNotebookOpen ? 'open' : ''}`}>
            <button className="nb-header" onClick={() => setIsNotebookOpen(!isNotebookOpen)}>
              <span>📓 Notebook ({notebookEntries.length})</span>
            </button>
            {isNotebookOpen && (
              <div className="nb-body">
                {notebookEntries.map(e => (
                  <div key={e.id} className="nb-item">
                    <span className="nb-label">{e.label}</span>
                    <button onClick={() => setActionCode(e.code)}>Insert</button>
                  </div>
                ))}
                {notebookEntries.length === 0 && <div className="nb-empty">No notes yet.</div>}
              </div>
            )}
          </div>
          <div className="event-stream-container">
            <h4 className="label-tech">Event Stream (from Ruby)</h4>
            <div className="event-list-compact">
              {allEvents.slice(-10).reverse().map((ev, i) => (
                <div key={i} className="event-entry-small" style={{ borderLeft: `2px solid ${ev.meta.color}` }}>
                  <span className="ev-icon">{ev.meta.icon}</span>
                  <span className="ev-text">{ev.meta.text}</span>
                  {ev.data?.object_id && <span className="ev-id">{ev.data.object_id}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="history-panel-compact">
            <h4 className="label-tech">Execution Log (formatted by Ruby)</h4>
            <div className="history-list-compact">
              {history.length === 0 && <div className="history-empty">集積されたログはありません</div>}
              {history.map((item, i) => (
                <div key={i} className={`history-entry ${item.error ? 'err' : 'ok'}`} onClick={() => setActionCode(item.code)}>
                  <div className="history-code-line">{item.code}</div>
                  {!item.error ? (
                    <div className="history-result-line" style={{ color: item.resultColor }}>
                      =&gt; {item.formattedResult}
                    </div>
                  ) : (
                    <div className="history-error-line">✗ {item.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Navi Guide (Ruby-driven) */}
          <div className={`navi-guide tactical-panel ${isNaviMinimized ? 'minimized' : ''}`}>
            <div className="navi-character"><div className="navi-eye" /></div>
            <div className="navi-content">
              <div className="navi-header">
                <span className="navi-title">NAVI SYSTEM v2.0</span>
                <button 
                  className="navi-toggle-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNaviMinimized(!isNaviMinimized);
                  }}
                  title={isNaviMinimized ? "Open Guide" : "Close Guide"}
                >
                  {isNaviMinimized ? '➕' : '✖'}
                </button>
              </div>
              {!isNaviMinimized && (
                <div className="navi-text">
                  {naviMessage || "システム稼働中... 何か質問はありますか？"}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {showVictory && <VictoryScreen onDismiss={() => setShowVictory(false)} />}
      {showOnboarding && (
        <Onboarding 
          steps={tutorial}
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('hasSeenOnboarding', 'true');
          }} 
        />
      )}
      <ToastSystem ref={toastRef} />
    </div>
  );
}

export default App;
