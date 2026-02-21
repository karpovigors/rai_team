import React, { useState } from 'react';
import './BuildingDetailsPage.css';
import authService from '../../../services/authService';

const buildingDetails = {
  name: 'КАРО 11 Октябрь',
  schedule: 'ежедневно, 10:00-02:00',
  address: 'ул. Новый Арбат, 24',
  metros: ['Смоленская', 'Смоленская', 'Арбатская'],
  description: 'Кинотеатр «КАРО 11 Октябрь» — это большой и красивый зал с большим экраном и сценой. Здесь часто проходят закрытые показы кинофильмов вместе с актерами, режиссерами и участниками съемок.',
  accessibility: [
    'Русский жестовый язык',
    'Субтитры',
    'Наличие пандусов',
    'Шрифт Брайля / сопровождение для слепых',
  ],
  reviews: [
    { user: 'User', text: 'Со всей семьей смотрели фильм, топчик, советую туда сходить, т.к. есть субтитры!' },
    { user: 'User1', text: 'Хорошее место' },
  ],
  image: 'https://avatars.mds.yandex.net/get-altay/1881734/2a0000016b31d4a3311953c7416353d0c893/XXL',
  mapImage: 'https://i.imgur.com/kM8v7vJ.png' // Placeholder for map
};

export const BuildingDetailsPage: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const username = authService.getUsername();

  const handleLoginClick = () => {
    window.location.href = '/auth';
  };

  const handleLogoutClick = () => {
    authService.logout();
    setIsProfileModalOpen(false);
    window.location.href = '/';
  };

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
          <h2>{buildingDetails.name}</h2>
        </div>
        <div className="info-grid">
          <div className="info-left">
            <ul>
              <li>{buildingDetails.schedule}</li>
              <li>{buildingDetails.address}</li>
              <li>{buildingDetails.metros.join(', ')}</li>
            </ul>
            <p className="description">{buildingDetails.description}</p>
          </div>
          <div className="info-right">
            <img src={buildingDetails.image} alt={buildingDetails.name} className="building-image" />
             <ul className="accessibility-list">
              {buildingDetails.accessibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className='info-right-map'>
            <img src={buildingDetails.mapImage} alt="Map" className="map-image" />
          </div>
        </div>

        <div className="reviews-section">
          {buildingDetails.reviews.map((review, index) => (
            <div className="review" key={index}>
              <div className="review-user-info">
                <div className="review-user-icon"></div>
                <p className="review-user">{review.user}</p>
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
