import React from 'react';
import './AuthPage.css';

export const AuthPage: React.FC = () => {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <h1>Информационно-навигационная платформа для людей с нарушением слуха</h1>
      </header>
      <main className="auth-main">
        <h2>Авторизация</h2>
        <form className="auth-form">
          <input type="text" placeholder="Логин" className="auth-input" />
          <input type="password" placeholder="Пароль" className="auth-input" />
          <button type="submit" className="auth-button">Войти</button>
        </form>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
