import { Link } from 'react-router-dom'
import Header from '/src/components/Header'

function Home() {
  return (
    <div className="home-page">
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Добро пожаловать!</h1>
        <p>Информационно-навигационная платформа</p>
        <Link to="/map-admin" style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Перейти к карте
        </Link>
      </main>
    </div>
  )
}

export default Home
