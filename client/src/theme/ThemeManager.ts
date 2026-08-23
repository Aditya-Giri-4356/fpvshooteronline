import { useEffect } from 'react';
import { useGameStore } from '../game/useGameStore';
import { MAP_THEMES, ThemeType } from '@fps/shared';

export function applyThemeVariables(themeId: ThemeType) {
  if (typeof document === 'undefined') return;

  const theme = MAP_THEMES[themeId] || MAP_THEMES.SCENIC_VALLEY;
  const root = document.documentElement;

  root.style.setProperty('--primary', theme.primaryColor);
  root.style.setProperty('--primary-hover', theme.accentColor);
  root.style.setProperty('--primary-glow', `${theme.primaryColor}55`);
  root.style.setProperty('--accent-theme', theme.accentColor);
  root.style.setProperty('--theme-bg-gradient', theme.bgGradient);

  if (themeId === 'DESERT_OUTPOST') {
    root.style.setProperty('--bg-dark', '#140c06');
    root.style.setProperty('--bg-card', 'rgba(28, 18, 12, 0.85)');
    root.style.setProperty('--bg-card-border', 'rgba(245, 158, 11, 0.25)');
  } else if (themeId === 'CYBER_METROPOLIS') {
    root.style.setProperty('--bg-dark', '#080915');
    root.style.setProperty('--bg-card', 'rgba(15, 12, 35, 0.88)');
    root.style.setProperty('--bg-card-border', 'rgba(6, 182, 212, 0.25)');
  } else if (themeId === 'SCENIC_VALLEY') {
    root.style.setProperty('--bg-dark', '#06130e');
    root.style.setProperty('--bg-card', 'rgba(10, 26, 20, 0.85)');
    root.style.setProperty('--bg-card-border', 'rgba(16, 185, 129, 0.22)');
  } else if (themeId === 'INDUSTRIAL_DOCKS') {
    root.style.setProperty('--bg-dark', '#0f1117');
    root.style.setProperty('--bg-card', 'rgba(22, 27, 34, 0.88)');
    root.style.setProperty('--bg-card-border', 'rgba(244, 63, 94, 0.22)');
  }
}

export const ThemeListener: React.FC = () => {
  const selectedTheme = useGameStore((state) => state.selectedTheme);

  useEffect(() => {
    applyThemeVariables(selectedTheme);
  }, [selectedTheme]);

  return null;
};
