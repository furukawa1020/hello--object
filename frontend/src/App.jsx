import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import MagicNote from './components/MagicNote';
import WorldView from './components/WorldView';
import ObjectDetail from './components/ObjectDetail';
import HistoryPanel from './components/HistoryPanel';
import NaviGuide from './components/NaviGuide';
import Onboarding from './components/Onboarding';
import Notebook from './components/Notebook';
import EventLog from './components/EventLog';
import VictoryScreen from './components/VictoryScreen';
import StatsBar from './components/StatsBar';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useLocalStorage from './hooks/useLocalStorage';
import { sounds, eventSound } from './utils/sounds';

const isVictory = (objects) => {
  const d = objects.find(o => o.id === 'cursed_door');
  return d && d.variables.open === true;
};

function App() {
  const [objects, setObjects]               = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory]               = useState([]);
  const [allEvents, setAllEvents]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [lastExecution, setLastExecution]   = useState({ result: null, error: null });
  const [actionCode, setActionCode]         = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notebookCode, setNotebookCode]     = useState('');
  const [showVictory, setShowVictory]       = useState(false);
  const [stats, setStats]                   = useState({ executions: 0, events: 0, objectsInteracted: new Set(), errors: 0 });
  const magicNoteRef = useRef(null);
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
      const r = await fetch('http://localhost:3000/state');
      const data = await r.json();
      if (data.success) setObjects(data.objects);
    } catch (e) { console.error('fetchState failed', e); }
    finally { setLoading(false); }
  };

  const handleExecute = useCallback(async (code) => {
    try {
      const r = await fetch('http://localhost:3000/execute', {
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
        result:     data.result,
        resultType: data.result_type,
        error:      data.error,
        events:     data.events || [],
        timestamp:  new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 49)]);

      if (data.objects) {
        setObjects(data.objects);
        if (selectedObject) {
          const updated = data.objects.find(o => o.id === selectedObject.id);
          if (updated) setSelectedObject(updated);
        }
        if (!showVictory && isVictory(data.objects)) {
          setTimeout(() => setShowVictory(true), 700);
        }
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
      const r = await fetch('http://localhost:3000/reset', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setObjects(data.objects);
        setHistory([]);
        setAllEvents([]);
        setSelectedObject(null);
        setLastExecution({ result: null, error: null });
        setShowVictory(false);
        setStats({ executions: 0, events: 0, objectsInteracted: new Set(), errors: 0 });
        storage.clear();
      }
    } catch (e) { console.error('reset failed', e); }
  };

  const handleSelectObject = (obj) => {
    sounds.select();
    setSelectedObject(obj);
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

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-brand">
          <h1>hello, <span className="brand-accent">object</span></h1>
          <span className="app-subtitle">Ruby Interactive World</span>
        </div>
        <StatsBar stats={statsDisplay} />
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
            onSelect={handleSelectObject}
            selectedId={selectedObject?.id}
          />
          <MagicNote
            ref={magicNoteRef}
            onExecute={handleExecute}
            selectedObject={selectedObject}
            initialCode={actionCode}
            onSaveToNotebook={setNotebookCode}
          />
        </div>

        <aside className="right-sidebar">
          <ObjectDetail
            object={selectedObject}
            onAction={setActionCode}
            objects={objects}
          />
          <Notebook onInsert={setActionCode} pendingCode={notebookCode} />
          <EventLog events={allEvents} />
          <HistoryPanel
            history={history}
            onRerun={setActionCode}
          />
        </aside>
      </main>

      <NaviGuide
        currentObject={selectedObject}
        lastResult={lastExecution.result}
        lastError={lastExecution.error}
      />

      {showVictory && <VictoryScreen onDismiss={() => setShowVictory(false)} />}
      {showOnboarding && (
        <Onboarding onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('hasSeenOnboarding', 'true');
        }} />
      )}
    </div>
  );
}

export default App;
