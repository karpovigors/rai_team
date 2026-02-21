import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';

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
