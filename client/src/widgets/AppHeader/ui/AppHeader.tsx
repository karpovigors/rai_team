import React from 'react';

interface AppHeaderProps {
  onOpenMap?: () => void;
  onOpenLearning?: () => void;
  onOpenProfile: () => void;
  profileAvatarUrl?: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMap, onOpenLearning, onOpenProfile, profileAvatarUrl }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = React.useState(
    localStorage.getItem('hasUnreadNotifications') === 'true',
  );

  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type !== 'push-received') {
        return;
      }
      localStorage.setItem('hasUnreadNotifications', 'true');
      setHasUnreadNotifications(true);
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

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

  const handleProfileOpen = () => {
    localStorage.setItem('hasUnreadNotifications', 'false');
    setHasUnreadNotifications(false);
    onOpenProfile();
  };

  return (
    <header className="details-header">
      <h1>
        <a href="/" className="details-title-link">
          Информационно-навигационная платформа для людей с нарушением слуха
        </a>
      </h1>
      <div className="details-header-right">
        <button type="button" className="details-map-button" onClick={onOpenMap}>Карта</button>
        {onOpenLearning && (
          <button type="button" className="details-map-button" onClick={onOpenLearning}>
            Обучение и советы
          </button>
        )}
        <div className="details-profile-wrapper">
          <button
            type="button"
            className={`details-profile-icon ${resolvedAvatarUrl ? 'details-profile-icon-with-image' : ''}`}
            aria-label="Профиль"
            onClick={handleProfileOpen}
            style={resolvedAvatarUrl ? { backgroundImage: `url(${resolvedAvatarUrl})` } : undefined}
          ></button>
          {hasUnreadNotifications && <span className="details-notification-dot" aria-label="Есть уведомления" />}
        </div>
      </div>
    </header>
  );
};
