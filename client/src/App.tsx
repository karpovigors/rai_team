import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';
import { MapSearchPage } from './pages/MapSearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { LearningPage } from './pages/LearningPage';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Основные пользовательские маршруты платформы */}
      <Route path="/" element={<BuildingsPage />} />
      <Route path="/building/:id" element={<BuildingDetailsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/map_search" element={<MapSearchPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/buildings" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={
          // Явная 404-страница помогает не путать ошибки роутинга с ошибками backend.
          <main style={{ padding: 24 }}>
            <h1>404</h1>
            <p>Страница не найдена.</p>
            <Link to="/">На главную</Link>
          </main>
        }
      />
    </Routes>
  );
}

export default App
