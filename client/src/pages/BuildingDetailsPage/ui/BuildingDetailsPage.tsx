import React from 'react';
import './BuildingDetailsPage.css';

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
  return (
    <div className="details-page">
      <header className="details-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
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
    </div>
  );
};
