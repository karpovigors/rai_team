import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  return (
    <header className="header">
      <h1>Информационно-навигационная платформа для deaf</h1>
      <nav className="nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Главная
        </Link>
        <Link to="/map-admin" className={`nav-link ${location.pathname === '/map-admin' ? 'active' : ''}`}>
          Карта
        </Link>
      </nav>
    </header>
  )
}

export default Header
