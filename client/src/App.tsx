import { AuthPage, RegisterPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';

function App() {
  const { pathname } = window.location;

  if (pathname.startsWith('/building/')) {
    return <BuildingDetailsPage />;
  }

  if (pathname === '/buildings') {
    return <BuildingsPage />;
  }

  if (pathname === '/register') {
    return <RegisterPage />;
  }

  return (
    <AuthPage />
  )
}

export default App
