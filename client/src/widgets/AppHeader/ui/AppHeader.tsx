import React from 'react';

interface AppHeaderProps {
  onOpenMap?: () => void;
  onOpenProfile: () => void;
  profileAvatarUrl?: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMap, onOpenProfile, profileAvatarUrl }) => {
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

  const resolvedAvatarUrl = profileAvatarUrl ? normalizeImageUrl(profileAvatarUrl) : '';

  return (
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
          className={`details-profile-icon ${resolvedAvatarUrl ? 'details-profile-icon-with-image' : ''}`}
          aria-label="Профиль"
          onClick={onOpenProfile}
          style={resolvedAvatarUrl ? { backgroundImage: `url(${resolvedAvatarUrl})` } : undefined}
        ></button>
      </div>
    </header>
  );
};
