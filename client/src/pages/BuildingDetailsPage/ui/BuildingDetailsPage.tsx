import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingDetailsPage.css';
import authService from '../../../services/authService';
import { AppHeader } from '../../../widgets/AppHeader/ui/AppHeader';
import { ProfileModal } from '../../../widgets/ProfileMenu/ui/ProfileModal';
import { useProfileActions } from '../../../widgets/ProfileMenu/model/useProfileActions';
import { useBuildingDetails } from '../model/hooks/useBuildingDetails';
import type { Review } from '../model/types';
import { useSyncModeratorRole } from '../model/hooks/useSyncModeratorRole';
import { useBuildingMutationActions } from '../model/hooks/useBuildingMutationActions';
import { useBuildingMapActions } from '../model/hooks/useBuildingMapActions';
import { DetailsPageState } from './layout/DetailsPageState';
import { BuildingDetailsContent } from './sections/BuildingDetailsContent';

export const BuildingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const buildingId = Number(window.location.pathname.split('/')[2]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { building, setBuilding, isLoading, loadError } = useBuildingDetails(buildingId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInfrastructureType, setEditInfrastructureType] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editMetros, setEditMetros] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSignLanguage, setEditSignLanguage] = useState(false);
  const [editSubtitles, setEditSubtitles] = useState(false);
  const [editRamps, setEditRamps] = useState(false);
  const [editBraille, setEditBraille] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<[number, number] | null>(null);
  const [editMapAddress, setEditMapAddress] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const [isModerator, setIsModerator] = useState(authService.isModerator());
  const username = authService.getUsername();

  useSyncModeratorRole({ isAuthenticated, setIsModerator });

  useEffect(() => {
    if (!building) {
      return;
    }

    setReviews(building.reviews || []);
    setEditTitle(building.title || '');
    setEditDescription(building.description || '');
    setEditInfrastructureType(building.infrastructure_type || '');
    setEditAddress(building.address || '');
    setEditSchedule(building.schedule || '');
    setEditMetros(Array.isArray(building.metros) ? building.metros.join(', ') : '');
    setEditSignLanguage(Boolean(building.sign_language));
    setEditSubtitles(Boolean(building.subtitles));
    setEditRamps(Boolean(building.ramps));
    setEditBraille(Boolean(building.braille));
    if (building.latitude && building.longitude) {
      setEditCoordinates([building.latitude, building.longitude]);
    }
    setEditImageFile(null);
    setEditError('');
    setIsEditMode(false);
  }, [building]);

  const { handleLoginClick, handleLogoutClick, handleProfileClick } = useProfileActions({
    setIsProfileModalOpen,
  });
  const { handleSaveEdit, handleDeleteObject, handleSubmitReview } = useBuildingMutationActions({
    building,
    setBuilding,
    isAuthenticated,
    reviewsSetters: {
      setReviews,
      setNewReviewText,
      setNewReviewRating,
    },
    reviewState: {
      newReviewText,
      newReviewRating,
    },
    editState: {
      editTitle,
      editDescription,
      editInfrastructureType,
      editAddress,
      editSchedule,
      editMetros,
      editImageFile,
      editSignLanguage,
      editSubtitles,
      editRamps,
      editBraille,
      editCoordinates,
    },
    editSetters: {
      setEditError,
      setIsSavingEdit,
      setIsDeleting,
      setIsEditMode,
    },
  });
  const { handleMapClick } = useBuildingMapActions({
    isEditMode,
    setEditCoordinates,
    setEditMapAddress,
    setEditAddress,
    setCoordinates,
    setAddress,
  });

  if (isLoading) {
    return <DetailsPageState message="Загрузка..." />;
  }

  if (loadError || !building) {
    return <DetailsPageState message={loadError || 'Объект не найден'} />;
  }

  const handleToggleEditMode = () => {
    setEditImageFile(null);
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="details-page">
      <AppHeader
        onOpenMap={() => navigate('/map-admin')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      <main className="details-main">
        <BuildingDetailsContent
          building={building}
          reviews={reviews}
          isModerator={isModerator}
          isEditMode={isEditMode}
          onToggleEditMode={handleToggleEditMode}
          editFormProps={{
            editError,
            editTitle,
            editInfrastructureType,
            editSchedule,
            editMetros,
            editDescription,
            editSignLanguage,
            editSubtitles,
            editRamps,
            editBraille,
            isSavingEdit,
            isDeleting,
            onTitleChange: setEditTitle,
            onInfrastructureTypeChange: setEditInfrastructureType,
            onScheduleChange: setEditSchedule,
            onMetrosChange: setEditMetros,
            onDescriptionChange: setEditDescription,
            onImageChange: setEditImageFile,
            onSignLanguageChange: setEditSignLanguage,
            onSubtitlesChange: setEditSubtitles,
            onRampsChange: setEditRamps,
            onBrailleChange: setEditBraille,
            onSubmit: handleSaveEdit,
            onDelete: handleDeleteObject,
          }}
          infoSectionProps={{
            isEditMode,
            editCoordinates,
            editMapAddress,
            coordinates,
            address,
            onMapClick: handleMapClick,
          }}
          reviewsSectionProps={{
            isAuthenticated,
            newReviewText,
            newReviewRating,
            onSubmit: handleSubmitReview,
            onReviewTextChange: setNewReviewText,
            onReviewRatingChange: setNewReviewRating,
          }}
        />
      </main>
      <footer className="details-footer"></footer>

      <ProfileModal
        isOpen={isProfileModalOpen}
        isAuthenticated={isAuthenticated}
        username={username}
        onClose={() => setIsProfileModalOpen(false)}
        onLogin={handleLoginClick}
        onProfile={handleProfileClick}
        onLogout={handleLogoutClick}
      />
    </div>
  );
};
