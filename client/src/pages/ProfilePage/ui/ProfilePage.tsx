import React from 'react';
import '../../AuthPage/ui/AuthPage.css';
import { useProfileForm } from '../model/hooks/useProfileForm';
import { ProfileForm } from './sections/ProfileForm';

export const ProfilePage: React.FC = () => {
  const {
    username,
    email,
    password,
    confirmPassword,
    error,
    success,
    isSaving,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  } = useProfileForm();

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
        <ProfileForm
          username={username}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          error={error}
          success={success}
          isSaving={isSaving}
          onUsernameChange={setUsername}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
        />
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
