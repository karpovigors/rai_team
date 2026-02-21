import React, { useEffect, useMemo, useState } from 'react';
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfrastructureType, setSelectedInfrastructureType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [infrastructureType, setInfrastructureType] = useState('');
  const [address, setAddress] = useState('');
  const [schedule, setSchedule] = useState('');
  const [metros, setMetros] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [signLanguage, setSignLanguage] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [ramps, setRamps] = useState(false);
  const [braille, setBraille] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const [isModerator, setIsModerator] = useState(authService.isModerator());
  const username = authService.getUsername();
  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''), []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      return;
    }

    const syncRole = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
      } catch {
        setIsModerator(authService.isModerator());
      }
    };

    void syncRole();
  }, [isAuthenticated]);

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

  const handleProfileClick = () => {
    setIsProfileModalOpen(false);
    window.location.href = '/profile';
  };

  const handleAddObjectSubmit = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      setCreateError('');
      if (!title.trim() || !address.trim()) {
        setCreateError('Заполните обязательные поля: название и адрес');
        return;
      }

      setIsCreating(true);
      try {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('infrastructureType', infrastructureType.trim());
        formData.append('address', address.trim());
        formData.append('schedule', schedule.trim());
        formData.append('metros', metros);
        formData.append('mapImageUrl', mapImageUrl.trim());
        formData.append('sign_language', String(signLanguage));
        formData.append('subtitles', String(subtitles));
        formData.append('ramps', String(ramps));
        formData.append('braille', String(braille));

        if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await authService.authFetch('/api/objects', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error || 'Не удалось создать объект');
        }

        setIsAddFormOpen(false);
        setTitle('');
        setDescription('');
        setInfrastructureType('');
        setAddress('');
        setSchedule('');
        setMetros('');
        setMapImageUrl('');
        setImageFile(null);
        setSignLanguage(false);
        setSubtitles(false);
        setRamps(false);
        setBraille(false);
        await loadBuildings();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setCreateError(error.message);
        } else {
          setCreateError('Не удалось создать объект');
        }
      } finally {
        setIsCreating(false);
      }
    })();
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
        {isModerator && isAddFormOpen && (
          <form className="moderator-inline-form" onSubmit={handleAddObjectSubmit}>
            {createError && <div className="moderator-inline-error">{createError}</div>}
            <input placeholder="Название*" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input placeholder="Тип (театр, кинотеатр...)" value={infrastructureType} onChange={(e) => setInfrastructureType(e.target.value)} />
            <input placeholder="Адрес*" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input placeholder="Расписание" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            <input placeholder="Метро через запятую" value={metros} onChange={(e) => setMetros(e.target.value)} />
            <input placeholder="URL карты" value={mapImageUrl} onChange={(e) => setMapImageUrl(e.target.value)} />
            <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <div className="moderator-inline-checklist">
              <label><input type="checkbox" checked={signLanguage} onChange={(e) => setSignLanguage(e.target.checked)} />Жестовый язык</label>
              <label><input type="checkbox" checked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} />Субтитры</label>
              <label><input type="checkbox" checked={ramps} onChange={(e) => setRamps(e.target.checked)} />Пандусы</label>
              <label><input type="checkbox" checked={braille} onChange={(e) => setBraille(e.target.checked)} />Брайль</label>
            </div>
            <button type="submit" disabled={isCreating}>{isCreating ? 'Сохранение...' : 'Сохранить объект'}</button>
          </form>
        )}
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
                <button type="button" className="profile-action-button" onClick={handleProfileClick}>
                  Профиль
                </button>
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
