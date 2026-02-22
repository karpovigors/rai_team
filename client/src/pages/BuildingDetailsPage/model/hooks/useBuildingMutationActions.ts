import { useCallback, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { BuildingDetails, Review } from '../types';
import { createBuildingReview, deleteBuilding, updateBuilding } from '../../api/buildingDetailsApi';

interface UseBuildingMutationActionsParams {
  building: BuildingDetails | null;
  setBuilding: Dispatch<SetStateAction<BuildingDetails | null>>;
  isAuthenticated: boolean;
  reviewsSetters: {
    setReviews: Dispatch<SetStateAction<Review[]>>;
    setNewReviewText: Dispatch<SetStateAction<string>>;
    setNewReviewRating: Dispatch<SetStateAction<number>>;
  };
  reviewState: {
    newReviewText: string;
    newReviewRating: number;
  };
  editState: {
    editTitle: string;
    editDescription: string;
    editInfrastructureType: string;
    editAddress: string;
    editSchedule: string;
    editMetros: string;
    editImageFile: File | null;
    editSignLanguage: boolean;
    editSubtitles: boolean;
    editRamps: boolean;
    editBraille: boolean;
    editCoordinates: [number, number] | null;
  };
  editSetters: {
    setEditError: Dispatch<SetStateAction<string>>;
    setIsSavingEdit: Dispatch<SetStateAction<boolean>>;
    setIsDeleting: Dispatch<SetStateAction<boolean>>;
    setIsEditMode: Dispatch<SetStateAction<boolean>>;
  };
}

interface UseBuildingMutationActionsResult {
  handleSaveEdit: (e: FormEvent) => void;
  handleDeleteObject: () => void;
  handleSubmitReview: (e: FormEvent) => void;
}

export const useBuildingMutationActions = ({
  building,
  setBuilding,
  isAuthenticated,
  reviewsSetters,
  reviewState,
  editState,
  editSetters,
}: UseBuildingMutationActionsParams): UseBuildingMutationActionsResult => {
  const handleSaveEdit = useCallback((e: FormEvent) => {
    void (async () => {
      e.preventDefault();
      if (!building) {
        return;
      }

      editSetters.setEditError('');
      if (!editState.editTitle.trim() || !editState.editAddress.trim()) {
        editSetters.setEditError('Заполните обязательные поля: название и адрес');
        return;
      }

      editSetters.setIsSavingEdit(true);
      try {
        const updated = await updateBuilding(building.id, {
          title: editState.editTitle,
          description: editState.editDescription,
          infrastructureType: editState.editInfrastructureType,
          address: editState.editAddress,
          schedule: editState.editSchedule,
          metros: editState.editMetros,
          sign_language: editState.editSignLanguage,
          subtitles: editState.editSubtitles,
          ramps: editState.editRamps,
          braille: editState.editBraille,
          image: editState.editImageFile,
          coordinates: editState.editCoordinates,
        });
        setBuilding(updated);
        reviewsSetters.setReviews(updated.reviews || []);
        editSetters.setIsEditMode(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          editSetters.setEditError(error.message);
        } else {
          editSetters.setEditError('Не удалось обновить объект');
        }
      } finally {
        editSetters.setIsSavingEdit(false);
      }
    })();
  }, [building, editSetters, editState, reviewsSetters, setBuilding]);

  const handleDeleteObject = useCallback(() => {
    void (async () => {
      if (!building) {
        return;
      }

      const confirmed = window.confirm('Удалить этот объект? Действие необратимо.');
      if (!confirmed) {
        return;
      }

      editSetters.setEditError('');
      editSetters.setIsDeleting(true);
      try {
        await deleteBuilding(building.id);
        window.location.href = '/';
      } catch (error: unknown) {
        if (error instanceof Error) {
          editSetters.setEditError(error.message);
        } else {
          editSetters.setEditError('Не удалось удалить объект');
        }
      } finally {
        editSetters.setIsDeleting(false);
      }
    })();
  }, [building, editSetters]);

  const handleSubmitReview = useCallback((e: FormEvent) => {
    void (async () => {
      e.preventDefault();
      const text = reviewState.newReviewText.trim();
      if (
        !text ||
        !isAuthenticated ||
        !building ||
        reviewState.newReviewRating < 1 ||
        reviewState.newReviewRating > 5
      ) {
        return;
      }

      try {
        const createdReview = await createBuildingReview(building.id, {
          text,
          rating: reviewState.newReviewRating,
        });
        reviewsSetters.setReviews((prev) => [
          { ...createdReview, rating: createdReview.rating ?? reviewState.newReviewRating },
          ...prev,
        ]);
        reviewsSetters.setNewReviewText('');
        reviewsSetters.setNewReviewRating(5);
      } catch {
        // Keep silent here to avoid breaking UX with alerts
      }
    })();
  }, [building, isAuthenticated, reviewState, reviewsSetters]);

  return {
    handleSaveEdit,
    handleDeleteObject,
    handleSubmitReview,
  };
};
