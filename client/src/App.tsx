import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';
import { MapAdminPage } from './pages/MapAdminPage';

function App() {
  const { pathname } = window.location;

  if (pathname.startsWith('/building/')) {
    return <BuildingDetailsPage />;
  }

  if (pathname === '/register') {
    return <RegisterPage />;
  }

  if (pathname === '/map-admin') {
    return <MapAdminPage />;
  }

  if (pathname === '/auth') {
    return <AuthPage />;
  }

  if (pathname === '/buildings') {
    window.location.replace('/');
    return null;
  }

  if (pathname === '/') {
    return <BuildingsPage />;
  }

  return <BuildingsPage />;
}

export default App
