import { useEffect, type Dispatch, type SetStateAction } from 'react';
import authService from '../../../../services/authService';

interface UseSyncModeratorRoleParams {
  isAuthenticated: boolean;
  setIsModerator: Dispatch<SetStateAction<boolean>>;
  setProfileAvatarUrl?: Dispatch<SetStateAction<string>>;
}

export const useSyncModeratorRole = ({
  isAuthenticated,
  setIsModerator,
  setProfileAvatarUrl,
}: UseSyncModeratorRoleParams): void => {
  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      setProfileAvatarUrl?.('');
      return;
    }

    const syncRole = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setAvatarUrl(response.user.avatar_url || '');
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
        setProfileAvatarUrl?.(response.user.avatar_url || '');
      } catch {
        setIsModerator(authService.isModerator());
        setProfileAvatarUrl?.(authService.getAvatarUrl() || '');
      }
    };

    void syncRole();
  }, [isAuthenticated, setIsModerator, setProfileAvatarUrl]);
};
