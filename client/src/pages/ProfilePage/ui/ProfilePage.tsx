import React from 'react';
import '../../AuthPage/ui/AuthPage.css';
import './ProfilePage.css';
import { useProfileEditor } from '../model/hooks/useProfileEditor';
import { ProfileForm } from './sections/ProfileForm';
import { ProfileAvatarEditor } from './sections/ProfileAvatarEditor';
import authService from '../../../services/authService';
import pushService, { type NotificationType } from '../../../services/pushService';

export const ProfilePage: React.FC = () => {
  const [pushStatus, setPushStatus] = React.useState('');
  const [isPushLoading, setIsPushLoading] = React.useState(false);
  const [notifyType, setNotifyType] = React.useState<NotificationType>('new_place');
  const [notifyTitle, setNotifyTitle] = React.useState('Новое заведение');
  const [notifyBody, setNotifyBody] = React.useState('Добавлено новое место на карте.');
  const [notifyUrl, setNotifyUrl] = React.useState('/');
  const isModerator = authService.isModerator();

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

  const handleEnablePush = () => {
    void (async () => {
      setIsPushLoading(true);
      setPushStatus('');
      try {
        await pushService.subscribe();
        setPushStatus('Push-уведомления включены');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPushStatus(err.message);
        } else {
          setPushStatus('Не удалось включить push-уведомления');
        }
      } finally {
        setIsPushLoading(false);
      }
    })();
  };

  const handleDisablePush = () => {
    void (async () => {
      setIsPushLoading(true);
      setPushStatus('');
      try {
        await pushService.unsubscribe();
        setPushStatus('Push-уведомления отключены');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPushStatus(err.message);
        } else {
          setPushStatus('Не удалось отключить push-уведомления');
        }
      } finally {
        setIsPushLoading(false);
      }
    })();
  };

  const handleSendTestNotification = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setIsPushLoading(true);
      setPushStatus('');
      try {
        await pushService.sendTestNotification({
          type: notifyType,
          title: notifyTitle,
          body: notifyBody,
          url: notifyUrl,
        });
        setPushStatus('Тестовое push-уведомление отправлено');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPushStatus(err.message);
        } else {
          setPushStatus('Не удалось отправить тестовое push-уведомление');
        }
      } finally {
        setIsPushLoading(false);
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

        <section className="push-section">
          <h3>Подписки и уведомления</h3>
          <p className="push-hint">
            Подпишитесь на push-уведомления о новых заведениях, открытиях маршрутов,
            предстоящих событиях и скидках.
          </p>
          <div className="push-actions">
            <button type="button" className="profile-secondary-button" disabled={isPushLoading} onClick={handleEnablePush}>
              Включить push
            </button>
            <button type="button" className="profile-secondary-button" disabled={isPushLoading} onClick={handleDisablePush}>
              Отключить push
            </button>
          </div>
          {pushStatus && <div className="auth-success">{pushStatus}</div>}

          {isModerator && (
            <form className="push-test-form" onSubmit={handleSendTestNotification}>
              <h4>Отправка тестового уведомления (модератор)</h4>
              <select value={notifyType} onChange={(e) => setNotifyType(e.target.value as NotificationType)}>
                <option value="new_place">Новое заведение</option>
                <option value="route_opening">Открытие маршрута</option>
                <option value="event">Событие</option>
                <option value="discount">Скидка</option>
                <option value="general">Общее</option>
              </select>
              <input value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} placeholder="Заголовок" required />
              <input value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} placeholder="Текст" required />
              <input value={notifyUrl} onChange={(e) => setNotifyUrl(e.target.value)} placeholder="Ссылка (например /building/1)" required />
              <button type="submit" className="auth-button" disabled={isPushLoading}>
                Отправить тестовый push
              </button>
            </form>
          )}
        </section>
      </main>
      <footer className="auth-footer"></footer>
    </div>
  );
};
