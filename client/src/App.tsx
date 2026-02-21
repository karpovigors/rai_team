import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const { pathname } = window.location;

  if (pathname.startsWith('/building/')) {
    return <BuildingDetailsPage />;
  }

  if (pathname === '/register') {
    return <RegisterPage />;
  }

  if (pathname === '/auth') {
    return <AuthPage />;
  }

  if (pathname === '/profile') {
    return <ProfilePage />;
  }

  if (pathname === '/buildings') {
    window.location.replace('/');
    return null;
  }

  if (pathname === '/') {
    return <BuildingsPage />;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>404</h1>
      <p>Страница не найдена.</p>
    </main>
  );
}

export default App
