import React from 'react';
import { useGameStore } from './game/useGameStore';
import { GameScene } from './components/3d/Scene';
import { LandingScreen } from './components/ui/LandingScreen';
import { LobbyScreen } from './components/ui/LobbyScreen';
import { GameHUD } from './components/ui/GameHUD';
import { ErrorToast } from './components/ui/ErrorToast';

export const App: React.FC = () => {
  const screen = useGameStore((state) => state.screen);

  return (
    <div className="app-container">
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
