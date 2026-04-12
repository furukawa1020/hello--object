import React, { useState, useEffect } from 'react';
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
import { sounds, eventSound } from './utils/sounds';

// Detect win: cursed_door is open
const isVictory = (objects) => {
  const cursed = objects.find(o => o.id === 'cursed_door');
  return cursed && cursed.variables.open === true;
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

  useEffect(() => {
    fetchState();
    if (!localStorage.getItem('hasSeenOnboarding')) setShowOnboarding(true);
  }, []);

  const fetchState = async () => {
    try {
      const r    = await fetch('http://localhost:3000/state');
      const data = await r.json();
      if (data.success) setObjects(data.objects);
    } catch (e) {
      console.error('fetchState failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (code) => {
    try {
      const r    = await fetch('http://localhost:3000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();

      setLastExecution({ result: data.result, error: data.error });
      setActionCode('');

      // Sound feedback
      if (data.error) {
        sounds.error();
      } else {
        // Fire event-specific sounds
        if (data.events && data.events.length > 0) {
          data.events.forEach(ev => eventSound(ev.name));
        } else {
          sounds.success();
        }
      }

      // Accumulate events
      if (data.events && data.events.length > 0) {
        setAllEvents(prev => [...prev, ...data.events].slice(-50));
      }

      // Stats update
      setStats(prev => {
        const interacted = new Set(prev.objectsInteracted);
        if (selectedObject) interacted.add(selectedObject.id);
        return {
          executions: prev.executions + 1,
          events:     prev.events + (data.events?.length || 0),
          objectsInteracted: interacted,
          errors:     prev.errors + (data.error ? 1 : 0),
        };
      });

      setHistory(prev => [{
        code,
        result:     data.result,
        resultType: data.result_type,
        error:      data.error,
        events:     data.events || [],
        timestamp:  new Date().toLocaleTimeString(),
      }, ...prev]);

      if (data.objects) {
        setObjects(data.objects);
        if (selectedObject) {
          const updated = data.objects.find(o => o.id === selectedObject.id);
          if (updated) setSelectedObject(updated);
        }
        // Check win condition
        if (!showVictory && isVictory(data.objects)) {
          setTimeout(() => setShowVictory(true), 600);
        }
      }
    } catch (e) {
      console.error('execute failed', e);
      sounds.error();
      setLastExecution({ result: null, error: 'Network Error: Cannot connect to server.' });
    }
  };

  const handleReset = async () => {
    if (!window.confirm('世界をリセットして、すべての変更を元に戻します。よろしいですか？')) return;
    sounds.reset();
    try {
      const r    = await fetch('http://localhost:3000/reset', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setObjects(data.objects);
        setHistory([]);
        setAllEvents([]);
        setSelectedObject(null);
        setLastExecution({ result: null, error: null });
        setShowVictory(false);
        setStats({ executions: 0, events: 0, objectsInteracted: new Set(), errors: 0 });
      }
    } catch (e) {
      console.error('reset failed', e);
    }
  };

  const handleSelectObject = (obj) => {
    sounds.select();
    setSelectedObject(obj);
  };

  const statsDisplay = {
    ...stats,
    objectsInteracted: stats.objectsInteracted.size,
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-brand">
          <h1>hello, <span className="brand-accent">object</span></h1>
          <span className="app-subtitle">Ruby Interactive World</span>
        </div>
        <StatsBar stats={statsDisplay} />
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">⟳ Reset World</button>
          <div className="status-badge">
            <span className="status-dot" />
            Ruby 4.0.0 Engine Active
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
          <HistoryPanel history={history} />
        </aside>
      </main>

      <NaviGuide
        currentObject={selectedObject}
        lastResult={lastExecution.result}
        lastError={lastExecution.error}
      />

      {showVictory && (
        <VictoryScreen onDismiss={() => setShowVictory(false)} />
      )}

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
