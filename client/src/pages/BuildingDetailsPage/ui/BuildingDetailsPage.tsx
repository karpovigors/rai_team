import React, { useEffect, useState } from 'react';
import './BuildingDetailsPage.css';
import authService from '../../../services/authService';

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
  map_image_url: string;
  sign_language: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  reviews: Review[];
}

export const BuildingDetailsPage: React.FC = () => {
  const buildingId = Number(window.location.pathname.split('/')[2]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const username = authService.getUsername();
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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

  const handleSubmitReview = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      const text = newReviewText.trim();
      if (!text || !isAuthenticated || !building) {
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/objects/${building.id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: username || 'Пользователь',
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
        </div>
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
          <div className='info-right-map'>
            <img src={building.map_image_url} alt="Map" className="map-image" />
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
