import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';

type CropRect = {
  x: number;
  y: number;
  size: number;
};

interface UseProfileEditorResult {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  success: string;
  isSaving: boolean;
  isDragOver: boolean;
  displayAvatar: string;
  sourceImage: string | null;
  crop: CropRect;
  imageDisplaySize: { width: number; height: number };
  fileInputRef: React.RefObject<HTMLInputElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setIsDragOver: (value: boolean) => void;
  handleImageFile: (file: File | null) => void;
  handleImageLoad: () => void;
  handleCropStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleClearNewImage: () => void;
  handleRemoveAvatar: () => void;
  handleEditCurrentAvatar: () => void;
  handleCropSizeChange: (value: number) => void;
  handleSubmit: (e: FormEvent) => void;
}

export const useProfileEditor = (): UseProfileEditorResult => {
  const navigate = useNavigate();
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth');
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
  }, [navigate]);

  useEffect(() => {
    if (!sourceImage || !imageRef.current) {
      setPreviewUrl('');
      return;
    }

    if (!imageDisplaySize.width || !imageDisplaySize.height || !imageNaturalSize.width || !imageNaturalSize.height) {
      setPreviewUrl('');
      return;
    }

    const image = imageRef.current;
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

  const clampCrop = useCallback((next: CropRect): CropRect => {
    if (!imageDisplaySize.width || !imageDisplaySize.height) {
      return next;
    }
    const maxSize = Math.min(imageDisplaySize.width, imageDisplaySize.height);
    const size = Math.max(80, Math.min(next.size, maxSize));
    const x = Math.max(0, Math.min(next.x, imageDisplaySize.width - size));
    const y = Math.max(0, Math.min(next.y, imageDisplaySize.height - size));
    return { x, y, size };
  }, [imageDisplaySize.height, imageDisplaySize.width]);

  const handleImageFile = useCallback((file: File | null) => {
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
  }, []);

  const handleImageLoad = useCallback(() => {
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
  }, [clampCrop]);

  const handleCropStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOffset({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  }, [crop.x, crop.y]);

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
  }, [clampCrop, dragOffset]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageFile(e.dataTransfer.files?.[0] || null);
  }, [handleImageFile]);

  const buildAvatarBlob = useCallback(async (): Promise<Blob | null> => {
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
  }, [crop.x, crop.y, crop.size, imageDisplaySize.height, imageDisplaySize.width, imageNaturalSize.height, imageNaturalSize.width, sourceImage]);

  const displayAvatar = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }
    if (avatarUrl && !removeAvatar) {
      return avatarUrl;
    }
    return '';
  }, [avatarUrl, previewUrl, removeAvatar]);

  const handleSubmit = useCallback((e: FormEvent) => {
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
  }, [buildAvatarBlob, confirmPassword, email, password, removeAvatar, sourceImage, username]);

  return {
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
    handleClearNewImage: () => {
      setSourceImage(null);
      setPreviewUrl('');
    },
    handleRemoveAvatar: () => {
      setSourceImage(null);
      setPreviewUrl('');
      setRemoveAvatar(true);
    },
    handleEditCurrentAvatar: () => {
      setSourceImage(avatarUrl);
      setPreviewUrl('');
      setRemoveAvatar(false);
    },
    handleCropSizeChange: (value: number) => {
      setCrop((prev) => clampCrop({ ...prev, size: value }));
    },
    handleSubmit,
  };
};
