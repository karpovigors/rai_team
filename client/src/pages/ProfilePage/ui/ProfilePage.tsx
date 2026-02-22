import React, { useEffect, useMemo, useRef, useState } from 'react';
import authService from '../../../services/authService';
import '../../AuthPage/ui/AuthPage.css';
import './ProfilePage.css';

type CropRect = {
  x: number;
  y: number;
  size: number;
};

export const ProfilePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, size: 160 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

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
        setAvatarUrl(response.user.avatar_url || '');
      } catch {
        setError('Не удалось загрузить профиль');
      }
    };

    void loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!sourceImage || !imageRef.current) {
      setPreviewUrl('');
      return;
    }

    const image = imageRef.current;
    if (!imageDisplaySize.width || !imageDisplaySize.height || !imageNaturalSize.width || !imageNaturalSize.height) {
      setPreviewUrl('');
      return;
    }

    const scaleX = imageNaturalSize.width / imageDisplaySize.width;
    const scaleY = imageNaturalSize.height / imageDisplaySize.height;
    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sSizeX = crop.size * scaleX;
    const sSizeY = crop.size * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, sx, sy, sSizeX, sSizeY, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [crop, imageDisplaySize, imageNaturalSize, sourceImage]);

  const clampCrop = (next: CropRect): CropRect => {
    if (!imageDisplaySize.width || !imageDisplaySize.height) {
      return next;
    }
    const maxSize = Math.min(imageDisplaySize.width, imageDisplaySize.height);
    const size = Math.max(80, Math.min(next.size, maxSize));
    const x = Math.max(0, Math.min(next.x, imageDisplaySize.width - size));
    const y = Math.max(0, Math.min(next.y, imageDisplaySize.height - size));
    return { x, y, size };
  };

  const handleImageFile = (file: File | null) => {
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Можно загружать только изображения');
      return;
    }

    setError('');
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setSourceImage(result || null);
      setPreviewUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = () => {
    if (!imageRef.current) {
      return;
    }
    const image = imageRef.current;
    const width = image.clientWidth;
    const height = image.clientHeight;
    setImageDisplaySize({ width, height });
    setImageNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
    const initialSize = Math.max(80, Math.min(width, height) * 0.55);
    const initialCrop: CropRect = {
      x: (width - initialSize) / 2,
      y: (height - initialSize) / 2,
      size: initialSize,
    };
    setCrop(clampCrop(initialCrop));
  };

  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOffset({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  };

  useEffect(() => {
    if (!dragOffset) {
      return;
    }
    const onMove = (e: MouseEvent) => {
      setCrop((prev) => {
        const next = {
          ...prev,
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        return clampCrop(next);
      });
    };
    const onUp = () => setDragOffset(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragOffset, imageDisplaySize.width, imageDisplaySize.height]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageFile(e.dataTransfer.files?.[0] || null);
  };

  const buildAvatarBlob = async (): Promise<Blob | null> => {
    if (!sourceImage || !imageRef.current) {
      return null;
    }
    if (!imageDisplaySize.width || !imageDisplaySize.height || !imageNaturalSize.width || !imageNaturalSize.height) {
      return null;
    }

    const image = imageRef.current;
    const scaleX = imageNaturalSize.width / imageDisplaySize.width;
    const scaleY = imageNaturalSize.height / imageDisplaySize.height;
    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sSizeX = crop.size * scaleX;
    const sSizeY = crop.size * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, sx, sy, sSizeX, sSizeY, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const displayAvatar = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }
    if (avatarUrl && !removeAvatar) {
      return avatarUrl;
    }
    return '';
  }, [avatarUrl, previewUrl, removeAvatar]);

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
        const payload = new FormData();
        payload.append('username', username.trim());
        payload.append('email', email.trim());

        if (password.trim()) {
          payload.append('password', password);
        }

        if (removeAvatar && !sourceImage) {
          payload.append('remove_avatar', 'true');
        }

        if (sourceImage) {
          const avatarBlob = await buildAvatarBlob();
          if (avatarBlob) {
            payload.append('avatar', avatarBlob, 'avatar.png');
          }
        }

        const response = await authService.updateProfile(payload);
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setAvatarUrl(response.user.avatar_url || '');
        authService.setIsModerator(response.user.is_moderator);
        setAvatarUrl(response.user.avatar_url || '');
        setSourceImage(null);
        setPreviewUrl('');
        setRemoveAvatar(false);
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
        <div className="profile-avatar-block">
          <div className="profile-avatar-preview">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Аватар" />
            ) : (
              <div className="profile-avatar-fallback">{(username || '?').slice(0, 1).toUpperCase()}</div>
            )}
          </div>

          <div
            className={`profile-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            Перетащите фото сюда или нажмите, чтобы выбрать
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-hidden-input"
            onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
          />

          {sourceImage && (
            <div className="profile-cropper-block">
              <p className="profile-crop-hint">Перетащите круг, чтобы выбрать область аватара</p>
              <div className="profile-crop-stage">
                <img
                  ref={imageRef}
                  src={sourceImage}
                  alt="Кадрирование"
                  className="profile-crop-image"
                  onLoad={handleImageLoad}
                />
                <div
                  className="profile-crop-circle"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.size}px`,
                    height: `${crop.size}px`,
                  }}
                  onMouseDown={handleCropStart}
                />
              </div>

              <label className="profile-size-control">
                Размер области
                <input
                  type="range"
                  min={80}
                  max={Math.max(120, Math.floor(Math.min(imageDisplaySize.width || 120, imageDisplaySize.height || 120)))}
                  value={Math.round(crop.size)}
                  onChange={(e) =>
                    setCrop((prev) =>
                      clampCrop({
                        ...prev,
                        size: Number(e.target.value),
                      }),
                    )
                  }
                />
              </label>
            </div>
          )}

          <div className="profile-avatar-actions">
            {sourceImage && (
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  setSourceImage(null);
                  setPreviewUrl('');
                }}
              >
                Убрать новое фото
              </button>
            )}
            {(avatarUrl || previewUrl) && (
              <button
                type="button"
                className="profile-secondary-button danger"
                onClick={() => {
                  setSourceImage(null);
                  setPreviewUrl('');
                  setRemoveAvatar(true);
                }}
              >
                Удалить аватар
              </button>
            )}
            {avatarUrl && !sourceImage && (
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  setSourceImage(avatarUrl);
                  setPreviewUrl('');
                  setRemoveAvatar(false);
                }}
              >
                Редактировать текущий аватар
              </button>
            )}
          </div>
        </div>

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
