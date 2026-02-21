import React, { useEffect, useState } from 'react';
import authService from '../../../services/authService';
import '../../AuthPage/ui/AuthPage.css';

export const ProfilePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/auth';
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        setUsername(response.user.username || '');
        setEmail(response.user.email || '');
      } catch {
        setError('Не удалось загрузить профиль');
      }
    };

    void loadCurrentUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!username.trim()) {
        setError('Имя пользователя не может быть пустым');
        return;
      }

      if (!email.trim()) {
        setError('Электронная почта не может быть пустой');
        return;
      }

      if (password && password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      setIsSaving(true);
      try {
        const payload: { username: string; email: string; password?: string } = {
          username: username.trim(),
          email: email.trim(),
        };

        if (password.trim()) {
          payload.password = password;
        }

        const response = await authService.updateProfile(payload);
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setIsModerator(response.user.is_moderator);
        setPassword('');
        setConfirmPassword('');
        setSuccess('Профиль успешно обновлен');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Не удалось обновить профиль');
        }
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <h1>
          <a href="/" className="auth-header-link">
            Информационно-навигационная платформа для людей с нарушением слуха
          </a>
        </h1>
      </header>
      <main className="auth-main">
        <h2>Профиль</h2>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Электронная почта"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Новый пароль"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Повторите новый пароль"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="auth-button" disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
