import React from 'react';
import './BuildingsPage.css';

const buildings = [
  {
    name: 'КАРО 11 Октябрь',
    image: 'https://avatars.mds.yandex.net/get-altay/1881734/2a0000016b31d4a3311953c7416353d0c893/XXL',
    details: [
      'ежедневно, 10:00-02:00',
      'ул. Новый Арбат, 24',
      'Смоленская, Смоленская, Арбатская',
    ],
    icons: ['hearing-aid', 'wheelchair', 'sign-language'],
  },
  {
    name: 'Театр Мимики и Жеста',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/34/40/1f/caption.jpg?w=1200&h=-1&s=1',
    details: ['Измайловский бул., 41'],
    icons: ['hearing-aid', 'wheelchair'],
  },
];

export const BuildingsPage: React.FC = () => {
  return (
    <div className="buildings-page">
      <header className="buildings-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
        <div className="header-right">
          <button className="map-button">Карта</button>
          <div className="profile-icon"></div>
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
          {buildings.map((building, index) => (
            <a href={`/building/${index}`} className="building-card" key={index}>
              <img src={building.image} alt={building.name} />
              <h3>{building.name}</h3>
              <ul>
                {building.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
              <div className="building-icons">
                {/* Icons would go here */}
              </div>
            </a>
          ))}
        </div>
      </main>
      <footer className="buildings-footer"></footer>
    </div>
  );
};
