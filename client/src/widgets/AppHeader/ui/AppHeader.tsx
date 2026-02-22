import React from 'react';

interface AppHeaderProps {
  onOpenMap?: () => void;
  onOpenProfile: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMap, onOpenProfile }) => (
  <header className="details-header">
    <h1>
      <a href="/" className="details-title-link">
        Информационно-навигационная платформа для людей с нарушением слуха
      </a>
    </h1>
    <div className="details-header-right">
      <button type="button" className="details-map-button" onClick={onOpenMap}>Карта</button>
      <button
        type="button"
        className="details-profile-icon"
        aria-label="Профиль"
        onClick={onOpenProfile}
      ></button>
    </div>
  </header>
);
