import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingsPage.css';
import authService from '../../../services/authService';

interface BuildingListItem {
  id: number;
  title: string;
  name?: string;
  address: string;
  schedule: string;
  metros: string[];
  image_url: string;
  infrastructure_type?: string;
  infrastructureType?: string;
}

export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfrastructureType, setSelectedInfrastructureType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const username = authService.getUsername();
  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''), []);

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

  useEffect(() => {
    void loadBuildings();
  }, [apiBaseUrl]);

  const normalizeText = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase('ru-RU');

  const infrastructureTypes = useMemo(
    () =>
      Array.from(
        new Set(
          buildings
            .map((building) => String(building.infrastructure_type || building.infrastructureType || '').trim())
            .filter(Boolean),
        ),
      ),
    [buildings],
  );

  const filteredBuildings = useMemo(() => {
    const query = normalizeText(searchQuery);
    return buildings.filter((building) => {
      const buildingTitle = normalizeText(building.title || building.name);
      const buildingType = normalizeText(building.infrastructure_type || building.infrastructureType);
      const selectedType = normalizeText(selectedInfrastructureType);

      const matchesTitle = !query || buildingTitle.includes(query);
      const matchesInfrastructureType =
        !selectedType || buildingType === selectedType;
      return matchesTitle && matchesInfrastructureType;
    });
  }, [buildings, searchQuery, selectedInfrastructureType]);

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
        <h1>
          <a href="/" className="buildings-header-link">
            Информационно-навигационная платформа для людей с нарушением слуха
          </a>
        </h1>
        <div className="header-right">
          <button className="map-button" onClick={() => navigate('/map-admin')}>Карта</button>
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
          <input
            type="text"
            placeholder="Поиск по названию"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            type="button"
            className={!selectedInfrastructureType ? 'active' : ''}
            onClick={() => setSelectedInfrastructureType('')}
          >
            Все
          </button>
          {infrastructureTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={selectedInfrastructureType === type ? 'active' : ''}
              onClick={() => setSelectedInfrastructureType(type)}
            >
              {type}
            </button>
          ))}
          {isModerator && (
            <button type="button" onClick={() => setIsAddFormOpen((prev) => !prev)}>
              {isAddFormOpen ? 'Скрыть форму' : 'Добавить объект'}
            </button>
          )}
        </div>
        <div className="buildings-list">
          {isLoading && <div>Загрузка...</div>}
          {loadError && <div>{loadError}</div>}
          {!isLoading && !loadError && filteredBuildings.map((building) => (
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
          {!isLoading && !loadError && filteredBuildings.length === 0 && (
            <div>Ничего не найдено по текущим фильтрам</div>
          )}
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
