import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../index';
import React from 'react';

describe('ThemeProvider', () => {
  it('provides default theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(['light', 'dark']).toContain(result.current.theme);
  });

  it('toggles theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    const initialTheme = result.current.theme;
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).not.toBe(initialTheme);
  });
});
