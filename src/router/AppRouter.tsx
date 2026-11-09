import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainMenuPage } from "../pages/MainMenuPage";
import { PlayPage } from "../pages/PlayPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
