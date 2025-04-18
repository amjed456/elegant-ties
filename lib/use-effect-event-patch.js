"use client";

import { useCallback, useRef } from 'react';

// Implementation of useEffectEvent for Radix UI
export function useEffectEvent(handler) {
  const handlerRef = useRef(handler);
  
  // Keep the handler ref updated with the latest handler
  handlerRef.current = handler;
  
  return useCallback((...args) => {
    // Call the latest handler
    return handlerRef.current(...args);
  }, []);
}

// Export as named and default export to match original module
export { useEffectEvent as default }; 