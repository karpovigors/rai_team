import React from 'react';

interface ProfileFormProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  error?: string;
  success?: string;
  isSaving: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  username,
  email,
  password,
  confirmPassword,
  error = '',
  success = '',
  isSaving,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => (
  <>
    {error && <div className="auth-error">{error}</div>}
    {success && <div className="auth-success">{success}</div>}
    <form className="auth-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Имя пользователя"
        className="auth-input"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Электронная почта"
        className="auth-input"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Новый пароль"
        className="auth-input"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      <input
        type="password"
        placeholder="Повторите новый пароль"
        className="auth-input"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
      />
      <button type="submit" className="auth-button" disabled={isSaving}>
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  </>
);
