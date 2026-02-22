import React from 'react';

interface BuildingsProfileModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  username: string | null;
  onClose: () => void;
  onLogin: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export const BuildingsProfileModal: React.FC<BuildingsProfileModalProps> = ({
  isOpen,
  isAuthenticated,
  username,
  onClose,
  onLogin,
  onProfile,
  onLogout,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {!isAuthenticated ? (
          <button type="button" className="profile-action-button" onClick={onLogin}>
            Войти
          </button>
        ) : (
          <>
            <p className="profile-username">{username || 'Пользователь'}</p>
            <button type="button" className="profile-action-button" onClick={onProfile}>
              Профиль
            </button>
            <button type="button" className="profile-action-button" onClick={onLogout}>
              Выйти
            </button>
          </>
        )}
      </div>
    </div>
  );
};
