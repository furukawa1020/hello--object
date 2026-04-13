import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const ToastSystem = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([]);

  useImperativeHandle(ref, () => ({
    add(message, type = 'info') {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    }
  }));

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item type-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'achievement' ? '🏆' : '🛡️'}
          </div>
          <div className="toast-content">
            <div className="toast-title">{t.type === 'achievement' ? 'ACHIEVEMENT UNLOCKED' : 'NOTIFICATION'}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ToastSystem;
