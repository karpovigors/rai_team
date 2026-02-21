import React, { useCallback, useEffect, useState } from 'react';
import './BuildingDetailsPage.css';
import authService from '../../../services/authService';
import { MapComponent } from '../../../components/MapComponent';

interface Review {
  id: number;
  author: string;
  text: string;
}

interface BuildingDetails {
  id: number;
  title: string;
  schedule: string;
  address: string;
  metros: string[];
  description: string;
  image_url: string;
  sign_language: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  reviews: Review[];
}

export const BuildingDetailsPage: React.FC = () => {
  const buildingId = Number(window.location.pathname.split('/')[2]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInfrastructureType, setEditInfrastructureType] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editMetros, setEditMetros] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSignLanguage, setEditSignLanguage] = useState(false);
  const [editSubtitles, setEditSubtitles] = useState(false);
  const [editRamps, setEditRamps] = useState(false);
  const [editBraille, setEditBraille] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<[number, number] | null>(null);
  const [editMapAddress, setEditMapAddress] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const [isModerator, setIsModerator] = useState(authService.isModerator());
  const username = authService.getUsername();
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      return;
    }

    const syncRole = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
      } catch {
        setIsModerator(authService.isModerator());
      }
    };

    void syncRole();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadBuilding = async () => {
      if (!Number.isFinite(buildingId)) {
        setLoadError('Некорректный идентификатор объекта');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch(`${apiBaseUrl}/api/objects/${buildingId}`);
        if (!response.ok) {
          throw new Error('Failed to load building details');
        }

        const data = await response.json();
        setBuilding(data);
        setReviews(data.reviews || []);
        setEditTitle(data.title || '');
        setEditDescription(data.description || '');
        setEditInfrastructureType(data.infrastructure_type || '');
        setEditAddress(data.address || '');
        setEditSchedule(data.schedule || '');
        setEditMetros(Array.isArray(data.metros) ? data.metros.join(', ') : '');
        setEditSignLanguage(Boolean(data.sign_language));
        setEditSubtitles(Boolean(data.subtitles));
        setEditRamps(Boolean(data.ramps));
        setEditBraille(Boolean(data.braille));
        if (data.latitude && data.longitude) {
          setEditCoordinates([data.latitude, data.longitude]);
        }
        setEditImageFile(null);
        setEditError('');
        setIsEditMode(false);
      } catch {
        setLoadError('Не удалось загрузить данные объекта');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBuilding();
  }, [apiBaseUrl, buildingId]);

  const handleLoginClick = () => {
    window.location.href = '/auth';
  };

  const handleLogoutClick = () => {
    authService.logout();
    setIsProfileModalOpen(false);
    window.location.href = '/';
  };

  const handleModeratorClick = () => {
    window.location.href = '/moderator';
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      if (!building) {
        return;
      }
      setEditError('');
      if (!editTitle.trim() || !editAddress.trim()) {
        setEditError('Заполните обязательные поля: название и адрес');
        return;
      }

      setIsSavingEdit(true);
      try {
        const formData = new FormData();
        formData.append('title', editTitle.trim());
        formData.append('description', editDescription.trim());
        formData.append('infrastructureType', editInfrastructureType.trim());
        formData.append('address', editAddress.trim());
        formData.append('schedule', editSchedule.trim());
        formData.append('metros', editMetros);
        formData.append('sign_language', String(editSignLanguage));
        formData.append('subtitles', String(editSubtitles));
        formData.append('ramps', String(editRamps));
        formData.append('braille', String(editBraille));
        if (editImageFile) {
          formData.append('image', editImageFile);
        }
        if (editCoordinates) {
          formData.append('latitude', String(editCoordinates[0]));
          formData.append('longitude', String(editCoordinates[1]));
        }

        const response = await authService.authFetch(`/api/objects/${building.id}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error || 'Не удалось обновить объект');
        }

        const updated = await response.json();
        setBuilding(updated);
        setReviews(updated.reviews || []);
        setIsEditMode(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setEditError(error.message);
        } else {
          setEditError('Не удалось обновить объект');
        }
      } finally {
        setIsSavingEdit(false);
      }
    })();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      const text = newReviewText.trim();
      if (!text || !isAuthenticated || !building) {
        return;
      }

      try {
        const response = await authService.authFetch(`/api/objects/${building.id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create review');
        }

        const createdReview = await response.json();
        setReviews((prev) => [createdReview, ...prev]);
        setNewReviewText('');
      } catch {
        // Keep silent here to avoid breaking UX with alerts
      }
    })();
  };

  const fetchAddress = useCallback(async (coords: [number, number], forEditMode: boolean) => {
    try {
      const [lat, lon] = coords;
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=47c62267-b242-42c9-9937-1505fa4e1b24&geocode=${lon},${lat}&format=json&lang=ru_RU`,
      );

      if (!response.ok) {
        throw new Error('Ошибка получения адреса');
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

      if (addressName || addressDescription) {
        const newAddress = [addressName, addressDescription].filter(Boolean).join(', ');
        if (forEditMode) {
          setEditMapAddress(newAddress);
          setEditAddress(newAddress);
        } else {
          setAddress(newAddress);
        }
      } else {
        if (forEditMode) {
          setEditMapAddress('Адрес не найден');
        } else {
          setAddress('Адрес не найден');
        }
      }
    } catch {
      if (forEditMode) {
        setEditMapAddress('');
      } else {
        setAddress('');
      }
    }
  }, []);

  const handleMapClick = useCallback((coords: [number, number]) => {
    if (isEditMode) {
      setEditCoordinates(coords);
      setEditMapAddress('');
      void fetchAddress(coords, true);
    } else {
      setCoordinates(coords);
      setAddress('');
      void fetchAddress(coords, false);
    }
  }, [isEditMode, fetchAddress]);

  if (isLoading) {
    return <div className="details-page"><main className="details-main">Загрузка...</main></div>;
  }

  if (loadError || !building) {
    return <div className="details-page"><main className="details-main">{loadError || 'Объект не найден'}</main></div>;
  }

  const accessibility = [
    building.sign_language ? 'Русский жестовый язык' : null,
    building.subtitles ? 'Субтитры' : null,
    building.ramps ? 'Наличие пандусов' : null,
    building.braille ? 'Шрифт Брайля / сопровождение для слепых' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="details-page">
      <header className="details-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
        <div className="details-header-right">
          <button type="button" className="details-map-button">Карта</button>
          <button
            type="button"
            className="details-profile-icon"
            aria-label="Профиль"
            onClick={() => setIsProfileModalOpen(true)}
          ></button>
        </div>
      </header>
      <main className="details-main">
        <div className="building-title">
          <h2>{building.title}</h2>
          {isModerator && (
            <button type="button" className="details-edit-button" onClick={() => setIsEditMode((prev) => !prev)}>
              {isEditMode ? 'Скрыть редактирование' : 'Редактировать объект'}
            </button>
          )}
        </div>
        {isModerator && isEditMode && (
          <form className="details-edit-form" onSubmit={handleSaveEdit}>
            {editError && <div className="details-edit-error">{editError}</div>}
            <input placeholder="Название*" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            <input placeholder="Тип (театр, кинотеатр...)" value={editInfrastructureType} onChange={(e) => setEditInfrastructureType(e.target.value)} />
           
            <input placeholder="Расписание" value={editSchedule} onChange={(e) => setEditSchedule(e.target.value)} />
            <input placeholder="Метро через запятую" value={editMetros} onChange={(e) => setEditMetros(e.target.value)} />
            <textarea placeholder="Описание" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} />
            <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
            <div className="details-edit-checklist">
              <label><input type="checkbox" checked={editSignLanguage} onChange={(e) => setEditSignLanguage(e.target.checked)} />Жестовый язык</label>
              <label><input type="checkbox" checked={editSubtitles} onChange={(e) => setEditSubtitles(e.target.checked)} />Субтитры</label>
              <label><input type="checkbox" checked={editRamps} onChange={(e) => setEditRamps(e.target.checked)} />Пандусы</label>
              <label><input type="checkbox" checked={editBraille} onChange={(e) => setEditBraille(e.target.checked)} />Брайль</label>
            </div>
            <button type="submit" disabled={isSavingEdit}>{isSavingEdit ? 'Сохранение...' : 'Сохранить изменения'}</button>
          </form>
        )}
        <div className="info-grid">
          <div className="info-left">
            <ul>
              <li>{building.schedule}</li>
              <li>{building.address}</li>
              <li>{building.metros.join(', ')}</li>
            </ul>
            <p className="description">{building.description}</p>
          </div>
          <div className="info-right">
            <img src={building.image_url} alt={building.title} className="building-image" />
             <ul className="accessibility-list">
              {accessibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="info-right-map">
            <div className="building-map-container">
              <MapComponent
                onMapClick={handleMapClick}
                selectedFeature={editCoordinates ? { geometry: { coordinates: editCoordinates } } : null}
              />
              {isEditMode ? (
                editCoordinates && (
                  <div className="building-map-coordinates">
                    <strong>Координаты:</strong> {editCoordinates[0].toFixed(6)}, {editCoordinates[1].toFixed(6)}
                    {editMapAddress && (
                      <div className="building-map-address">
                        <strong>Адрес:</strong> {editMapAddress}
                      </div>
                    )}
                  </div>
                )
              ) : coordinates && (
                <div className="building-map-coordinates">
                  <strong>Координаты:</strong> {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                  {address && (
                    <div className="building-map-address">
                      <strong>Адрес:</strong> {address}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="reviews-section">
          {isAuthenticated ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <textarea
                className="review-textarea"
                placeholder="Напишите отзыв"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                rows={4}
                required
              />
              <button type="submit" className="review-submit-button">Отправить отзыв</button>
            </form>
          ) : (
            <div className="review-auth-required">
              Для написания отзыва нужна авторизация. <a href="/auth">Войти</a>
            </div>
          )}

          {reviews.map((review) => (
            <div className="review" key={review.id}>
              <div className="review-user-info">
                <div className="review-user-icon"></div>
                <p className="review-user">{review.author}</p>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="details-footer"></footer>

      {isProfileModalOpen && (
        <div className="details-profile-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="details-profile-modal" onClick={(e) => e.stopPropagation()}>
            {!isAuthenticated ? (
              <button type="button" className="details-profile-action-button" onClick={handleLoginClick}>
                Войти
              </button>
            ) : (
              <>
                <p className="details-profile-username">{username || 'Пользователь'}</p>
                {isModerator && (
                  <button type="button" className="details-profile-action-button" onClick={handleModeratorClick}>
                    Режим модератора
                  </button>
                )}
                <button type="button" className="details-profile-action-button" onClick={handleLogoutClick}>
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
