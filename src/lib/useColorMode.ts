'use client';
import { useState, useEffect } from 'react';

const MODE_KEY = 'dbtech-color-mode';

const voidColors = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#22C55E', info: '#3B82F6', warning: '#EAB308',
  border: '#222222', borderHover: '#F59E0B',
};

const cyberColors = {
  void: '#050e07', carbon: '#07120a', graphite: '#0a1a0e',
  amber: '#10ca78', amberLight: '#39ff7e', amberDark: '#0a9e5a',
  white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', error: '#22C55E', info: '#3B82F6', warning: '#10ca78',
  border: 'rgba(16, 202, 120, 0.2)', borderHover: '#10ca78',
};

export type ColorMode = 'void' | 'cyber';

export function useColorMode() {
  const [mode, setMode] = useState<ColorMode>('void');

  useEffect(() => {
    const read = () => {
      try {
        return localStorage.getItem(MODE_KEY) === 'cyber' ? 'cyber' : 'void';
      } catch { return 'void' as ColorMode; }
    };
    setMode(read());
    const interval = setInterval(() => setMode(read()), 400);
    const onStorage = () => setMode(read());
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(interval); window.removeEventListener('storage', onStorage); };
  }, []);

  return { mode, colors: mode === 'cyber' ? cyberColors : voidColors };
}
