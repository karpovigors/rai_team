import React, { useEffect, useMemo, useState } from 'react';
import './BuildingsPage.css';
import authService from '../../../services/authService';

interface BuildingListItem {
  id: number;
  title: string;
  address: string;
  schedule: string;
  metros: string[];
  image_url: string;
}

export const BuildingsPage: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const username = authService.getUsername();
  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''), []);

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch(`${apiBaseUrl}/api/objects`);
        if (!response.ok) {
          throw new Error('Failed to load buildings');
        }
        const data = await response.json();
        setBuildings(data);
      } catch {
        setLoadError('Не удалось загрузить список объектов');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBuildings();
  }, [apiBaseUrl]);

  const handleLoginClick = () => {
    window.location.href = '/auth';
  };

  const handleLogoutClick = () => {
    authService.logout();
    setIsProfileModalOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="buildings-page">
      <header className="buildings-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
        <div className="header-right">
          <button className="map-button">Карта</button>
          <button
            type="button"
            className="profile-icon"
            aria-label="Профиль"
            onClick={() => setIsProfileModalOpen(true)}
          ></button>
        </div>
      </header>
      <main className="buildings-main">
        <div className="search-container">
          <input type="text" placeholder="Поиск" className="search-input" />
        </div>
        <div className="filter-buttons">
          <button>Театр</button>
          <button>Кинотеатр</button>
          <button>Музей</button>
          <button>...</button>
        </div>
        <div className="buildings-list">
          {isLoading && <div>Загрузка...</div>}
          {loadError && <div>{loadError}</div>}
          {!isLoading && !loadError && buildings.map((building) => (
            <a href={`/building/${building.id}`} className="building-card" key={building.id}>
              <img src={building.image_url} alt={building.title} />
              <h3>{building.title}</h3>
              <ul>
                {building.schedule && <li>{building.schedule}</li>}
                {building.address && <li>{building.address}</li>}
                {Array.isArray(building.metros) && building.metros.length > 0 && (
                  <li>{building.metros.join(', ')}</li>
                )}
              </ul>
              <div className="building-icons">
                {/* Icons would go here */}
              </div>
            </a>
          ))}
        </div>
      </main>
      <footer className="buildings-footer"></footer>

      {isProfileModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            {!isAuthenticated ? (
              <button type="button" className="profile-action-button" onClick={handleLoginClick}>
                Войти
              </button>
            ) : (
              <>
                <p className="profile-username">{username || 'Пользователь'}</p>
                <button type="button" className="profile-action-button" onClick={handleLogoutClick}>
                  Выйти
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
