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

      // Accumulate events
      if (data.events && data.events.length > 0) {
        setAllEvents(prev => [...prev, ...data.events].slice(-50));
      }

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
      }
    } catch (e) {
      console.error('execute failed', e);
      setLastExecution({ result: null, error: 'Network Error: Cannot connect to server.' });
    }
  };

  const handleReset = async () => {
    if (!window.confirm('世界をリセットして、すべての変更を元に戻します。よろしいですか？')) return;
    try {
      const r    = await fetch('http://localhost:3000/reset', { method: 'POST' });
      const data = await r.json();
      if (data.success) {
        setObjects(data.objects);
        setHistory([]);
        setAllEvents([]);
        setSelectedObject(null);
        setLastExecution({ result: null, error: null });
      }
    } catch (e) {
      console.error('reset failed', e);
    }
  };

  const handleSaveToNotebook = (code) => {
    // Pass down to Notebook via state — Notebook manages its own data
    setNotebookCode(code);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-brand">
          <h1>hello, <span className="brand-accent">object</span></h1>
          <span className="app-subtitle">Ruby Interactive World</span>
        </div>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">⟳ Reset World</button>
          <div className="status-badge">
            <span className="status-dot" />
            Ruby 4.0.0 Engine Active
          </div>
        </div>
      </header>

      <main className="main-layout">
        {/* Left: World + Note */}
        <div className="left-column">
          <WorldView
            objects={objects}
            onSelect={setSelectedObject}
            selectedId={selectedObject?.id}
          />
          <MagicNote
            onExecute={handleExecute}
            selectedObject={selectedObject}
            initialCode={actionCode}
            onSaveToNotebook={handleSaveToNotebook}
          />
        </div>

        {/* Right: Detail + Notebook + History */}
        <aside className="right-sidebar">
          <ObjectDetail
            object={selectedObject}
            onAction={setActionCode}
            objects={objects}
          />
          <Notebook
            onInsert={setActionCode}
            pendingCode={notebookCode}
          />
          <EventLog events={allEvents} />
          <HistoryPanel history={history} />
        </aside>
      </main>

      <NaviGuide
        currentObject={selectedObject}
        lastResult={lastExecution.result}
        lastError={lastExecution.error}
      />

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
