import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hello_object_save';

/**
 * useLocalStorage — persists game state (history + notebook) across reloads.
 */
const useLocalStorage = () => {
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const save = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked
    }
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { load, save, clear };
};

export default useLocalStorage;
