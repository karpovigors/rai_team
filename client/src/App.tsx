import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';
import { MapAdminPage } from './pages/MapAdminPage';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BuildingsPage />} />
      <Route path="/building/:id" element={<BuildingDetailsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/map-admin" element={<MapAdminPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/buildings" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={
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
