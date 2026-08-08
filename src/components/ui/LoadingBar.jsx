import React, { useEffect, useState } from 'react';
import { onLoadingChange } from '../../lib/api.js';

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onLoadingChange((isLoading) => {
      setLoading(isLoading);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 200);
    const t2 = setTimeout(() => setProgress(90), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]" style={{ background: 'var(--border, #e5e7eb)' }}>
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0d9488, #d97706)',
          boxShadow: '0 0 10px rgba(13, 148, 136, 0.25)',
        }}
      />
    </div>
  );
}
