import { useEffect, type Dispatch, type SetStateAction } from 'react';
import authService from '../../../../services/authService';

interface UseSyncModeratorRoleParams {
  isAuthenticated: boolean;
  setIsModerator: Dispatch<SetStateAction<boolean>>;
}

export const useSyncModeratorRole = ({
  isAuthenticated,
  setIsModerator,
}: UseSyncModeratorRoleParams): void => {
  useEffect(() => {
    if (!isAuthenticated) {
      setIsModerator(false);
      return;
    }

    const syncRole = async () => {
      try {
        const response = await authService.fetchCurrentUser();
        authService.setUsername(response.user.username);
        authService.setEmail(response.user.email || '');
        authService.setIsModerator(response.user.is_moderator);
        setIsModerator(response.user.is_moderator);
      } catch {
        setIsModerator(authService.isModerator());
      }
    };

    void syncRole();
  }, [isAuthenticated, setIsModerator]);
};
