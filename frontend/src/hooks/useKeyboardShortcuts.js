import { useEffect } from 'react';

/**
 * useKeyboardShortcuts — global keyboard shortcuts for the game
 *
 * @param {Object} handlers - map of shortcut key → handler function
 *   handlers.onInspect    — 'i' key: inspect selected object in mirror
 *   handlers.onReflect    — 'r' key: reflect in mirror
 *   handlers.onFocusInput — '/' or Enter: focus the MagicNote textarea
 *   handlers.onTalk       — 't' key: talk to selected NPC
 *   handlers.onRead       — 'e' key: read selected Tome
 *   handlers.onEscape     — Escape: dismiss overlays
 */
const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      // Don't trigger when user is typing in an input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.key.toLowerCase()) {
        case 'i':
          e.preventDefault();
          handlers.onInspect?.();
          break;
        case 'r':
          e.preventDefault();
          handlers.onReflect?.();
          break;
        case 't':
          e.preventDefault();
          handlers.onTalk?.();
          break;
        case 'e':
          e.preventDefault();
          handlers.onRead?.();
          break;
        case '/':
        case 'enter':
          e.preventDefault();
          handlers.onFocusInput?.();
          break;
        case 'escape':
          handlers.onEscape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
};

export default useKeyboardShortcuts;
