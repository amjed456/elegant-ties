"use client";

// Polyfill for useEffectEvent
import { useCallback, useRef } from 'react';

// Define our own useEffectEvent implementation
export function useEffectEvent(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args) => {
    return ref.current(...args);
  }, []);
}

// Add it to React global in client-side environments only
if (typeof window !== 'undefined') {
  // Wait for React to be available
  setTimeout(() => {
    if (typeof React !== 'undefined' && !React.useEffectEvent) {
      React.useEffectEvent = useEffectEvent;
    }
  }, 0);
}

export {}; 