import React, { useState } from 'react';
import './AuthPage.css';
import authService from '../../../services/authService';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      const response = await authService.register({ username, email, password });
      authService.setTokens(response.access, response.refresh);
      authService.setUsername(response.user.username);
      authService.setEmail(response.user.email || '');
      authService.setAvatarUrl(response.user.avatar_url || '');
      authService.setIsModerator(response.user.is_moderator);
      setSuccess(true);
      // Redirect to main page or dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        setError('Сервер регистрации недоступен. Проверьте API URL и CORS.');
        return;
      }
      setError('Ошибка регистрации. Попробуйте другое имя пользователя.');
    }
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
        <h2>Регистрация</h2>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Регистрация успешна! Перенаправление...</div>}
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
            placeholder="Пароль"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">Зарегистрироваться</button>
        </form>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
