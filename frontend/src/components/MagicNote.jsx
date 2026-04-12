import React, { useState } from 'react';

const MagicNote = ({ onExecute, selectedObject }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onExecute(input);
      setInput('');
    }
  };

  const handleSuggestion = (method) => {
    if (selectedObject) {
      const internalName = selectedObject.name_internal || selectedObject.id.split('_')[0]; 
      // Assuming we have an internal name or use id part
      // For the prototype, we use 'door' for the door object
      const target = selectedObject.id.includes('door') ? 'door' : selectedObject.id;
      setInput(`${target}.${method}`);
    }
  };

  return (
    <div className="magic-note tactical-panel">
      <div className="note-header">
        <span>Magic Note</span>
        {selectedObject && (
          <div className="suggestions">
            <span className="label">Try:</span>
            {['unlock', 'open', 'close', 'lock'].map(m => (
              <button key={m} onClick={() => handleSuggestion(m)} className="suggestion-btn">
                .{m}
              </button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="オブジェクトに話しかけてみよう... (例: door.unlock)"
          className="mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className="button-primary">Execute</button>
      </form>
    </div>
  );
};

export default MagicNote;
