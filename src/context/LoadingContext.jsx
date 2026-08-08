import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const countRef = useRef(0);

  const start = useCallback(() => {
    countRef.current += 1;
    setLoading(true);
  }, []);

  const stop = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      setLoading(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, start, stop }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
