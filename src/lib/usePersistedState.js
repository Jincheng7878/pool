import { useState, useEffect } from "react";

/**
 * usePersistedState
 * A lightweight wrapper around useState + localStorage.
 *
 * @param {string} key localStorage key
 * @param {*} defaultValue initial value
 */
export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  return [state, setState];
}
