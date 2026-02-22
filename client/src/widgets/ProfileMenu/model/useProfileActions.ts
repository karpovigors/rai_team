import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

interface UseProfileActionsParams {
  setIsProfileModalOpen: Dispatch<SetStateAction<boolean>>;
}

interface UseProfileActionsResult {
  handleLoginClick: () => void;
  handleLogoutClick: () => void;
  handleProfileClick: () => void;
}

export const useProfileActions = ({
  setIsProfileModalOpen,
}: UseProfileActionsParams): UseProfileActionsResult => {
  const navigate = useNavigate();

  const handleLoginClick = useCallback(() => {
    setIsProfileModalOpen(false);
    navigate('/auth');
  }, [navigate, setIsProfileModalOpen]);

  const handleLogoutClick = useCallback(() => {
    authService.logout();
    setIsProfileModalOpen(false);
    navigate('/');
  }, [navigate, setIsProfileModalOpen]);

  const handleProfileClick = useCallback(() => {
    setIsProfileModalOpen(false);
    navigate('/profile');
  }, [navigate, setIsProfileModalOpen]);

  return {
    handleLoginClick,
    handleLogoutClick,
    handleProfileClick,
  };
};
