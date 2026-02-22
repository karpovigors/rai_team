import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingDetailsPage.css';
import authService from '../../../services/authService';
import { AppHeader } from '../../../widgets/AppHeader/ui/AppHeader';
import { ProfileModal } from '../../../widgets/ProfileMenu/ui/ProfileModal';
import { useProfileActions } from '../../../widgets/ProfileMenu/model/useProfileActions';
import { useBuildingDetails } from '../model/hooks/useBuildingDetails';
import type { Review } from '../model/types';
import { geocodeAddressToCoordinates } from '../api/buildingDetailsApi';
import { useSyncModeratorRole } from '../model/hooks/useSyncModeratorRole';
import { useBuildingMutationActions } from '../model/hooks/useBuildingMutationActions';
import { useBuildingMapActions } from '../model/hooks/useBuildingMapActions';
import { DetailsPageState } from './layout/DetailsPageState';
import { BuildingDetailsContent } from './sections/BuildingDetailsContent';
import { AccessibilityPanel } from '../../../components/AccessibilityPanel/AccessibilityPanel';
import type { AccessibilitySettings } from '../../../hooks/useAccessibility';

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
  const [editUpcomingEvent, setEditUpcomingEvent] = useState('');
  const [editDiscountInfo, setEditDiscountInfo] = useState('');
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
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(authService.getAvatarUrl() || '');
  const username = authService.getUsername();
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    largeFont: false,
    highContrast: false,
    screenReader: false,
  });

  useSyncModeratorRole({ isAuthenticated, setIsModerator, setProfileAvatarUrl });

  useEffect(() => {
    if (!building) {
      return;
    }

    let isCancelled = false;

    setReviews(building.reviews || []);
    setEditTitle(building.title || '');
    setEditDescription(building.description || '');
    setEditUpcomingEvent(building.upcoming_event || '');
    setEditDiscountInfo(building.discount_info || '');
    setEditInfrastructureType(building.infrastructure_type || '');
    setEditAddress(building.address || '');
    setEditSchedule(building.schedule || '');
    setEditMetros(Array.isArray(building.metros) ? building.metros.join(', ') : '');
    setEditSignLanguage(Boolean(building.sign_language));
    setEditSubtitles(Boolean(building.subtitles));
    setEditRamps(Boolean(building.ramps));
    setEditBraille(Boolean(building.braille));
    const resolvedLatitude = building.latitude ?? building.lat;
    const resolvedLongitude = building.longitude ?? building.lng;
    const hasValidCoordinates = Number.isFinite(resolvedLatitude) && Number.isFinite(resolvedLongitude);
    if (hasValidCoordinates) {
      const nextCoordinates: [number, number] = [resolvedLatitude as number, resolvedLongitude as number];
      setEditCoordinates(nextCoordinates);
      setCoordinates(nextCoordinates);
      void (async () => {
        try {
          const geocodedCoordinates = await geocodeAddressToCoordinates(building.address || '');
          if (isCancelled || !geocodedCoordinates) {
            return;
          }
          setCoordinates(geocodedCoordinates);
          setEditCoordinates(geocodedCoordinates);
        } catch {
          // fallback остается на координатах из backend
        }
      })();
    } else {
      void (async () => {
        try {
          const geocodedCoordinates = await geocodeAddressToCoordinates(building.address || '');
          if (isCancelled || !geocodedCoordinates) {
            setEditCoordinates(null);
            setCoordinates(null);
            return;
          }
          setEditCoordinates(geocodedCoordinates);
          setCoordinates(geocodedCoordinates);
        } catch {
          if (!isCancelled) {
            setEditCoordinates(null);
            setCoordinates(null);
          }
        }
      })();
    }
    setAddress(building.address || '');
    setEditImageFile(null);
    setEditError('');
    setIsEditMode(false);

    return () => {
      isCancelled = true;
    };
  }, [building]);

  const { handleLoginClick, handleLogoutClick, handleProfileClick } = useProfileActions({
    setIsProfileModalOpen,
  });
  const { handleSaveEdit, handleDeleteObject, handleSubmitReview, handleDeleteReview } = useBuildingMutationActions({
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
      editUpcomingEvent,
      editDiscountInfo,
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
    isModerator,
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
        onOpenMap={() => navigate('/map_search')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        profileAvatarUrl={profileAvatarUrl}
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
            editAddress,
            editInfrastructureType,
            editSchedule,
            editMetros,
            editDescription,
            editUpcomingEvent,
            editDiscountInfo,
            editSignLanguage,
            editSubtitles,
            editRamps,
            editBraille,
            isSavingEdit,
            isDeleting,
            onTitleChange: setEditTitle,
            onAddressChange: setEditAddress,
            onInfrastructureTypeChange: setEditInfrastructureType,
            onScheduleChange: setEditSchedule,
            onMetrosChange: setEditMetros,
            onDescriptionChange: setEditDescription,
            onUpcomingEventChange: setEditUpcomingEvent,
            onDiscountInfoChange: setEditDiscountInfo,
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
            isModerator,
            currentUsername: username,
            newReviewText,
            newReviewRating,
            onSubmit: handleSubmitReview,
            onDeleteReview: handleDeleteReview,
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

      <AccessibilityPanel
        settings={accessibilitySettings}
        onSettingsChange={setAccessibilitySettings}
      />
    </div>
  );
};
