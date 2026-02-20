import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MapAdmin from './pages/MapAdmin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map-admin" element={<MapAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
