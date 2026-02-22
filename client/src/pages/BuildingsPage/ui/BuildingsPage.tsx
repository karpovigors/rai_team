import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingsPage.css';
import authService from '../../../services/authService';
import { MapComponent } from '../../../components/MapComponent';

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

interface MapFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
  };
}

export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<number>>(new Set());
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [signLanguage, setSignLanguage] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [ramps, setRamps] = useState(false);
  const [braille, setBraille] = useState(false);
  const [addCoordinates, setAddCoordinates] = useState<[number, number] | null>(null);
  const [addMapAddress, setAddMapAddress] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const [isModerator, setIsModerator] = useState(authService.isModerator());
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(authService.getAvatarUrl() || '');
  const username = authService.getUsername();
  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''), []);

  const normalizeImageUrl = (rawUrl: string): string => {
    const value = String(rawUrl || '').trim();
    if (!value) {
      return '';
    }

    try {
      const parsed = new URL(value, window.location.origin);
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
        return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return parsed.toString();
    } catch {
      return value;
    }
  };

  const loadBuildings = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/objects`);
      if (!response.ok) {
        throw new Error('Failed to load buildings');
      }
      const data = await response.json();
      setBuildings(
        (Array.isArray(data) ? data : []).map((building) => ({
          ...building,
          image_url: normalizeImageUrl(building.image_url),
        })),
      );
      setBrokenImageIds(new Set());
    } catch {
      setLoadError('Не удалось загрузить список объектов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBuildings();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      setProfileAvatarUrl('');
      return;
    }

    const syncUser = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setAvatarUrl(response.user.avatar_url || '');
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
        setProfileAvatarUrl(response.user.avatar_url || '');
      } catch {
        setIsModerator(authService.isModerator());
        setProfileAvatarUrl(authService.getAvatarUrl() || '');
      }
    };

    void syncUser();
  }, [isAuthenticated]);

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

  const fetchAddressByCoords = async (coords: [number, number]) => {
    try {
      const [lat, lon] = coords;
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=47c62267-b242-42c9-9937-1505fa4e1b24&geocode=${lon},${lat}&format=json&lang=ru_RU`,
      );
      if (!response.ok) {
        throw new Error('Geocoder failed');
      }

      const data = (await response.json()) as {
        response?: {
          GeoObjectCollection?: {
            featureMember?: Array<{
              GeoObject?: {
                name?: string;
                description?: string;
              };
            }>;
          };
        };
      };

      const feature = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      const addressName = feature?.name;
      const addressDescription = feature?.description;
      const computedAddress = [addressName, addressDescription].filter(Boolean).join(', ');
      if (computedAddress) {
        setAddMapAddress(computedAddress);
        setAddress(computedAddress);
      } else {
        setAddMapAddress('Адрес не найден');
      }
    } catch {
      setAddMapAddress('');
    }
  };

  const handleAddMapClick = (coords: [number, number], _clickedObject: MapFeature | null) => {
    setAddCoordinates(coords);
    setAddMapAddress('');
    void fetchAddressByCoords(coords);
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
        formData.append('sign_language', String(signLanguage));
        formData.append('subtitles', String(subtitles));
        formData.append('ramps', String(ramps));
        formData.append('braille', String(braille));
        if (addCoordinates) {
          formData.append('latitude', String(addCoordinates[0]));
          formData.append('longitude', String(addCoordinates[1]));
        }
        if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await authService.authFetch('/api/objects', {
          method: 'POST',
          body: formData,
        });

        if (response.status === 401) {
          setCreateError('Нужна авторизация. Войдите в аккаунт и повторите.');
          window.location.href = '/auth';
          return;
        }

        if (response.status === 403) {
          setCreateError('Только модератор или администратор может добавлять объекты.');
          return;
        }

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
        setImageFile(null);
        setSignLanguage(false);
        setSubtitles(false);
        setRamps(false);
        setBraille(false);
        setAddCoordinates(null);
        setAddMapAddress('');
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
          <button className="map-button" onClick={() => navigate('/map-admin')}>Карта</button>
          <button
            type="button"
            className={`profile-icon ${profileAvatarUrl ? 'profile-icon-with-image' : ''}`}
            aria-label="Профиль"
            onClick={() => setIsProfileModalOpen(true)}
            style={profileAvatarUrl ? { backgroundImage: `url(${normalizeImageUrl(profileAvatarUrl)})` } : undefined}
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
            <input
              placeholder="Название*"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              placeholder="Тип (театр, кинотеатр...)"
              value={infrastructureType}
              onChange={(e) => setInfrastructureType(e.target.value)}
            />
            <input
              placeholder="Адрес*"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              placeholder="Расписание"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <input
              placeholder="Метро через запятую"
              value={metros}
              onChange={(e) => setMetros(e.target.value)}
            />
            <textarea
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div className="moderator-inline-map">
              <MapComponent onMapClick={handleAddMapClick} />
            </div>
            {addCoordinates && (
              <div className="moderator-inline-coordinates">
                <strong>Координаты:</strong> {addCoordinates[0].toFixed(6)}, {addCoordinates[1].toFixed(6)}
                {addMapAddress && <div><strong>Определенный адрес:</strong> {addMapAddress}</div>}
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <div className="moderator-inline-checklist">
              <label><input type="checkbox" checked={signLanguage} onChange={(e) => setSignLanguage(e.target.checked)} />Жестовый язык</label>
              <label><input type="checkbox" checked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} />Субтитры</label>
              <label><input type="checkbox" checked={ramps} onChange={(e) => setRamps(e.target.checked)} />Пандусы</label>
              <label><input type="checkbox" checked={braille} onChange={(e) => setBraille(e.target.checked)} />Брайль</label>
            </div>
            <button type="submit" disabled={isCreating}>
              {isCreating ? 'Сохранение...' : 'Сохранить объект'}
            </button>
          </form>
        )}
        <div className="buildings-list">
          {isLoading && <div>Загрузка...</div>}
          {loadError && <div>{loadError}</div>}
          {!isLoading && !loadError && filteredBuildings.map((building) => (
            <a href={`/building/${building.id}`} className="building-card" key={building.id}>
              {building.image_url && !brokenImageIds.has(building.id) ? (
                <img
                  src={building.image_url}
                  alt={building.title}
                  onError={() =>
                    setBrokenImageIds((prev) => {
                      const next = new Set(prev);
                      next.add(building.id);
                      return next;
                    })
                  }
                />
              ) : (
                <div className="building-image-placeholder">Фото отсутствует</div>
              )}
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
