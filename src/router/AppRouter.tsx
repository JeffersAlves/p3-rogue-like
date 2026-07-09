import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GameProvider } from "../contexts/GameContext";
import { BattlePage } from "../pages/BattlePage";
import { CharacterCreationPage } from "../pages/CharacterCreationPage";
import { MainMenuPage } from "../pages/MainMenuPage";
import { ExplorationPage } from "../pages/ExplorationPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<MainMenuPage />} />
          <Route path="/create" element={<CharacterCreationPage />} />
          <Route path="/explore" element={<ExplorationPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
};
