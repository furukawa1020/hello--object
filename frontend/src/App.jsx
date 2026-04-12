import React, { useState, useEffect } from 'react';
import './App.css';
import MagicNote from './components/MagicNote';
import WorldView from './components/WorldView';
import ObjectDetail from './components/ObjectDetail';
import HistoryPanel from './components/HistoryPanel';
import NaviGuide from './components/NaviGuide';
import Onboarding from './components/Onboarding';
import Notebook from './components/Notebook';

function App() {
  const [objects, setObjects]             = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [lastExecution, setLastExecution] = useState({ result: null, error: null });
  const [actionCode, setActionCode]       = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchState();
    if (!localStorage.getItem('hasSeenOnboarding')) {
      setShowOnboarding(true);
    }
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch('http://localhost:3000/state');
      const data = await response.json();
      if (data.success) setObjects(data.objects);
    } catch (error) {
      console.error('Failed to fetch state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (code) => {
    try {
      const response = await fetch('http://localhost:3000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      setLastExecution({ result: data.result, error: data.error });
      setActionCode('');

      setHistory(prev => [{
        code,
        result: data.result,
        error: data.error,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev]);

      if (data.objects) {
        setObjects(data.objects);
        if (selectedObject) {
          const updated = data.objects.find(o => o.id === selectedObject.id);
          if (updated) setSelectedObject(updated);
        }
      }
    } catch (error) {
      console.error('Execution failed:', error);
      setLastExecution({ result: null, error: 'Network Error: Cannot connect to server.' });
    }
  };

  const handleReset = async () => {
    if (!window.confirm('世界をリセットして、すべての変更を元に戻します。よろしいですか？')) return;
    try {
      const response = await fetch('http://localhost:3000/reset', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setObjects(data.objects);
        setHistory([]);
        setSelectedObject(null);
        setLastExecution({ result: null, error: null });
      }
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>hello, object</h1>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">⟳ Reset World</button>
          <div className="status-badge">Ruby 4.0.0 Engine Active</div>
        </div>
      </header>

      <main className="main-layout">
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
            onSaveToNotebook={(code) => {/* Notebook handles its own state */}}
          />
        </div>

        <aside className="right-sidebar">
          <ObjectDetail
            object={selectedObject}
            onAction={setActionCode}
            objects={objects}
          />
          <Notebook onInsert={setActionCode} />
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
