import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';

interface UseProfileFormResult {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  success: string;
  isSaving: boolean;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handleSubmit: (e: FormEvent) => void;
}

export const useProfileForm = (): UseProfileFormResult => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      } catch {
        setError('Не удалось загрузить профиль');
      }
    };

    void loadCurrentUser();
  }, [navigate]);

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
  }, [confirmPassword, email, password, username]);

  return {
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
  };
};
