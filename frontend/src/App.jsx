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
      <header className="app-header">
        <div className="app-brand">
          <h1><span className="brand-accent">💎</span> RUBY SOVEREIGN</h1>
        </div>
        
        <div className="header-actions">
          <div className="system-stats-hud">
            [ EXECUTIONS: <span className="mono">{stats.executions}</span> ]
            [ EVENTS: <span className="mono">{allEvents.length}</span> ]
            [ ERRORS: <span className="mono">{stats.errors}</span> ]
          </div>
          <button onClick={handleExportJourney} className="export-btn">⎙ JOURNEY_EXPORT</button>
          <button className="reset-btn" onClick={handleReset}>SYSTEM_RESET</button>
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
          <div className="tactical-panel editor-hud">
            <div className="panel-header">
              <span className="label-tech">MAGIC_NOTE v4.0</span>
              <span className="panel-hint">REALTIME_EVALUATOR</span>
            </div>
            <MagicNote
              ref={magicNoteRef}
              onExecute={handleExecute}
              selectedObject={selectedObject}
              initialCode={actionCode}
              onSaveToNotebook={handleSaveToNotebook}
            />
          </div>
        </div>

        <aside className="right-sidebar">
          {selectedObject ? (
            <div className="object-detail tactical-panel animate-in">
              <div className="panel-header">
                <span className="label-tech">SELECTION_DATA</span>
                <span className="p-id">ID: {selectedObject.id}</span>
              </div>
              <div className="detail-scroll">
                <div className="object-header-group">
                  <h3>{selectedObject.name}</h3>
                  <span className="obj-class-badge">{selectedObject.class_name}</span>
                </div>
                
                <div className="description-block">
                  <p>{selectedObject.description}</p>
                </div>

                <div className="tactical-labels">
                  {selectedObject.labels?.map((l, i) => (
                    <div key={i} className={`status-label level-${l.level}`}>
                      <span className="status-icon">{l.icon}</span> {l.text}
                    </div>
                  ))}
                </div>

                <div className="tactical-actions">
                  <h4>Available Methods</h4>
                  <div className="actions-grid">
                    {selectedObject.actions?.map((act, i) => (
                      <button 
                        key={i} 
                        className="action-btn"
                        onClick={() => setActionCode(act.code)}
                        disabled={act.disabled}
                      >
                        <span className="act-label">{act.label}</span>
                        <span className="act-code">{act.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="state-block">
                  <h4>Memory State</h4>
                  <div className="var-list">
                    {Object.entries(selectedObject.variables).map(([k, v]) => (
                      <div key={k} className="var-item">
                        <span className="var-key">@{k}</span>
                        <span className={`var-val ${typeof v}`}>{v.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedObject.schematic && (
                  <div className="schematic-block">
                    <h4>Internal Schematic</h4>
                    <pre className="mono">{selectedObject.schematic}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-selection-hint tactical-panel">
              <div className="scanline-overlay"></div>
              <p>NO_ACTIVE_SELECTION</p>
              <span className="text-minor">Select an object in the world to extract its essence.</span>
            </div>
          )}

          <div className="event-system tactical-panel">
            <div className="panel-header">
              <span className="label-tech">SYSTEM_MEMORY_STREAM</span>
              <span className="log-count">+{allEvents.length}</span>
            </div>
            <div className="event-list-scroll">
              {allEvents.slice(-20).reverse().map((ev, i) => (
                <div key={i} className="event-row" style={{ borderLeftColor: ev.meta.color }}>
                  <span className="e-icon">{ev.meta.icon}</span>
                  <div className="e-content">
                    <span className="e-text">{ev.meta.text}</span>
                    <span className="e-meta">{ev.data?.object_id || 'system'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="history-log tactical-panel">
            <div className="panel-header">
              <span className="label-tech">EXECUTION_LOG</span>
              <span className="log-count">#{history.length}</span>
            </div>
            <div className="log-scroll">
              {history.length === 0 && <div className="log-empty">LOG_EMPTY</div>}
              {history.map((h, i) => (
                <div key={i} className={`log-entry ${h.error ? 'is-error' : ''}`} onClick={() => setActionCode(h.code)}>
                  <div className="log-input">> {h.code}</div>
                  {h.error ? (
                    <div className="log-error">X {h.error}</div>
                  ) : (
                    <div className="log-result">=> {h.formattedResult || h.result?.toString()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`navi-guide tactical-panel ${isNaviMinimized ? 'minimized' : ''}`}>
            <div className="panel-header">
              <span className="label-tech">NAVI_LINK_v2</span>
              <button 
                className="navi-toggle-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNaviMinimized(!isNaviMinimized);
                }}
              >
                {isNaviMinimized ? '▲' : '▼'}
              </button>
            </div>
            {!isNaviMinimized && (
              <div className="navi-body">
                <div className="navi-avatar"><div className="navi-eye"></div></div>
                <div className="navi-text">{naviMessage || "SYSTEM READY... WAITING FOR INPUT."}</div>
              </div>
            )}
          </div>
        </aside>
      </main>

      <ToastSystem ref={toastRef} />
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
    </div>

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
