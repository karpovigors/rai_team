import React, { useEffect, useState } from 'react';
import authService from '../../../services/authService';
import './ModeratorPage.css';

export const ModeratorPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [infrastructureType, setInfrastructureType] = useState('');
  const [address, setAddress] = useState('');
  const [schedule, setSchedule] = useState('');
  const [metros, setMetros] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [signLanguage, setSignLanguage] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [ramps, setRamps] = useState(false);
  const [braille, setBraille] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isModerator, setIsModerator] = useState(authService.isModerator());

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      setIsCheckingRole(false);
      return;
    }

    const syncRole = async () => {
      setIsCheckingRole(true);
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
      } catch {
        setIsModerator(authService.isModerator());
      } finally {
        setIsCheckingRole(false);
      }
    };

    void syncRole();
  }, [isAuthenticated]);

  if (isCheckingRole) {
    return (
      <div className="moderator-page">
        <main className="moderator-main">Проверка прав...</main>
      </div>
    );
  }

  if (!isAuthenticated || !isModerator) {
    return (
      <div className="moderator-page">
        <main className="moderator-main">
          <h2>Доступ ограничен</h2>
          <p>Страница доступна только для учетных записей модератора.</p>
          <a href="/">На главную</a>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !address.trim()) {
      setError('Заполните обязательные поля: название и адрес');
      return;
    }

    const token = authService.getAccessToken();
    if (!token) {
      setError('Нужно заново авторизоваться');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('infrastructureType', infrastructureType.trim());
    formData.append('address', address.trim());
    formData.append('schedule', schedule.trim());
    formData.append('metros', metros);
    formData.append('mapImageUrl', mapImageUrl.trim());
    formData.append('sign_language', String(signLanguage));
    formData.append('subtitles', String(subtitles));
    formData.append('ramps', String(ramps));
    formData.append('braille', String(braille));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    setIsSubmitting(true);
    try {
      const response = await authService.authFetch('/api/objects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Не удалось создать объект');
      }

      const created = await response.json();
      setSuccess('Объект успешно добавлен');
      setTimeout(() => {
        window.location.href = `/building/${created.id}`;
      }, 800);
    } catch (submitError: unknown) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError('Не удалось добавить объект');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="moderator-page">
      <header className="moderator-header">
        <h1>Режим модератора</h1>
        <a href="/">На главную</a>
      </header>
      <main className="moderator-main">
        <h2>Добавить новый объект</h2>
        {error && <div className="moderator-error">{error}</div>}
        {success && <div className="moderator-success">{success}</div>}

        <form className="moderator-form" onSubmit={handleSubmit}>
          <label>
            Название*
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label>
            Тип (театр, кинотеатр и т.д.)
            <input value={infrastructureType} onChange={(e) => setInfrastructureType(e.target.value)} />
          </label>

          <label>
            Адрес*
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>

          <label>
            Расписание
            <input value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </label>

          <label>
            Метро (через запятую)
            <input value={metros} onChange={(e) => setMetros(e.target.value)} />
          </label>

          <label>
            Описание
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </label>

          <label>
            Фото объекта
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>

          <label>
            URL изображения карты
            <input value={mapImageUrl} onChange={(e) => setMapImageUrl(e.target.value)} />
          </label>

          <div className="moderator-checklist">
            <label><input type="checkbox" checked={signLanguage} onChange={(e) => setSignLanguage(e.target.checked)} /> Русский жестовый язык</label>
            <label><input type="checkbox" checked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} /> Субтитры</label>
            <label><input type="checkbox" checked={ramps} onChange={(e) => setRamps(e.target.checked)} /> Наличие пандусов</label>
            <label><input type="checkbox" checked={braille} onChange={(e) => setBraille(e.target.checked)} /> Шрифт Брайля</label>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Добавить объект'}
          </button>
        </form>
      </main>
    </div>
  );
};
