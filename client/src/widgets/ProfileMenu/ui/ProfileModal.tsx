import React from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  username: string | null;
  onClose: () => void;
  onLogin: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
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
    <div className="details-profile-modal-overlay" onClick={onClose}>
      <div className="details-profile-modal" onClick={(e) => e.stopPropagation()}>
        {!isAuthenticated ? (
          <button type="button" className="details-profile-action-button" onClick={onLogin}>
            Войти
          </button>
        ) : (
          <>
            <p className="details-profile-username">{username || 'Пользователь'}</p>
            <button type="button" className="details-profile-action-button" onClick={onProfile}>
              Профиль
            </button>
            <button type="button" className="details-profile-action-button" onClick={onLogout}>
              Выйти
            </button>
          </>
        )}
      </div>
    </div>
  );
};
