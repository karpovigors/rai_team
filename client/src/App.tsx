import { AuthPage } from './pages/AuthPage';
import { BuildingsPage } from './pages/BuildingsPage';

function App() {
  const { pathname } = window.location;

  if (pathname === '/buildings') {
    return <BuildingsPage />;
  }

  return (
    <AuthPage />
  )
}

export default App
