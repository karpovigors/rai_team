import React, { useState } from 'react';
import './AuthPage.css';
import authService from '../../../services/authService';

export const AuthPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authService.login({ username, password });
      authService.setTokens(response.access, response.refresh);
      authService.setUsername(response.user.username);
      // Redirect to main page or dashboard
      window.location.href = '/';
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Invalid credentials') {
        setError('Неверный логин или пароль');
        return;
      }
      if (err instanceof TypeError) {
        setError('Сервер авторизации недоступен. Проверьте API URL и CORS.');
        return;
      }
      setError('Ошибка авторизации. Попробуйте позже.');
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
      </header>
      <main className="auth-main">
        <h2>Авторизация</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="auth-button">Войти</button>
        </form>
        <div className="auth-register-link">
          <p>Нет аккаунта? <a href="/register">Зарегистрируйтесь</a></p>
        </div>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
