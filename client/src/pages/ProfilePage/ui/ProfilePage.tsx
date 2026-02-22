import React from 'react';
import '../../AuthPage/ui/AuthPage.css';
import './ProfilePage.css';
import { useProfileEditor } from '../model/hooks/useProfileEditor';
import { ProfileForm } from './sections/ProfileForm';
import { ProfileAvatarEditor } from './sections/ProfileAvatarEditor';

export const ProfilePage: React.FC = () => {
  const {
    username,
    email,
    password,
    confirmPassword,
    error,
    success,
    isSaving,
    isDragOver,
    displayAvatar,
    sourceImage,
    crop,
    imageDisplaySize,
    fileInputRef,
    imageRef,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    setIsDragOver,
    handleImageFile,
    handleImageLoad,
    handleCropStart,
    handleDrop,
    handleClearNewImage,
    handleRemoveAvatar,
    handleEditCurrentAvatar,
    handleCropSizeChange,
    handleSubmit,
  } = useProfileEditor();

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

        <ProfileAvatarEditor
          username={username}
          displayAvatar={displayAvatar}
          sourceImage={sourceImage}
          crop={crop}
          imageDisplaySize={imageDisplaySize}
          isDragOver={isDragOver}
          fileInputRef={fileInputRef}
          imageRef={imageRef}
          onDragOverChange={setIsDragOver}
          onImageFile={handleImageFile}
          onImageLoad={handleImageLoad}
          onCropStart={handleCropStart}
          onDrop={handleDrop}
          onClearNewImage={handleClearNewImage}
          onRemoveAvatar={handleRemoveAvatar}
          onEditCurrentAvatar={handleEditCurrentAvatar}
          onCropSizeChange={handleCropSizeChange}
        />

        <ProfileForm
          username={username}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          error=""
          success=""
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
