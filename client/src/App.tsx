import React from 'react';
import { useGameStore } from './game/useGameStore';
import { GameScene } from './components/3d/Scene';
import { LandingScreen } from './components/ui/LandingScreen';
import { LobbyScreen } from './components/ui/LobbyScreen';
import { GameHUD } from './components/ui/GameHUD';
import { ErrorToast } from './components/ui/ErrorToast';
import { ThemeListener } from './theme/ThemeManager';

export const App: React.FC = () => {
  const screen = useGameStore((state) => state.screen);

  return (
    <div className="app-container">
      {/* Dynamic Theme CSS Variable Updater */}
      <ThemeListener />

      {/* 3D Background & Playable Scene */}
      <GameScene />

      {/* Ephemeral UI Screen Routing */}
      {screen === 'LANDING' && <LandingScreen />}
      {screen === 'LOBBY' && <LobbyScreen />}
      {screen === 'PLAYING' && <GameHUD />}

      {/* Global Error Toast */}
      <ErrorToast />
    </div>
  );
};

export default App;
