'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check if the user has a saved preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update the HTML class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add a slight delay to help with transitions
    setTimeout(() => {
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }, 10);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
