import React, { createContext, useContext, useState } from 'react';
import { dark, light } from '../theme.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const c = isDark ? dark : light;
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, c }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
