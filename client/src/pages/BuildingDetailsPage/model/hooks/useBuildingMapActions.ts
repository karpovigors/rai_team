import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { reverseGeocodeCoordinates } from '../../api/buildingDetailsApi';

interface UseBuildingMapActionsParams {
  isEditMode: boolean;
  isModerator: boolean;
  setEditCoordinates: Dispatch<SetStateAction<[number, number] | null>>;
  setEditMapAddress: Dispatch<SetStateAction<string>>;
  setEditAddress: Dispatch<SetStateAction<string>>;
  setCoordinates: Dispatch<SetStateAction<[number, number] | null>>;
  setAddress: Dispatch<SetStateAction<string>>;
}

interface UseBuildingMapActionsResult {
  handleMapClick: (coords: [number, number]) => void;
}

export const useBuildingMapActions = ({
  isEditMode,
  isModerator,
  setEditCoordinates,
  setEditMapAddress,
  setEditAddress,
  setCoordinates,
  setAddress,
}: UseBuildingMapActionsParams): UseBuildingMapActionsResult => {
  const fetchAddress = useCallback(async (coords: [number, number], forEditMode: boolean) => {
    try {
      const newAddress = await reverseGeocodeCoordinates(coords);
      if (newAddress) {
        if (forEditMode) {
          setEditMapAddress(newAddress);
          setEditAddress(newAddress);
        } else {
          setAddress(newAddress);
        }
      } else if (forEditMode) {
        setEditMapAddress('Адрес не найден');
      } else {
        setAddress('Адрес не найден');
      }
    } catch {
      if (forEditMode) {
        setEditMapAddress('');
      } else {
        setAddress('');
      }
    }
  }, [setAddress, setEditAddress, setEditMapAddress]);

  const handleMapClick = useCallback((coords: [number, number]) => {
    if (!isModerator) {
      return;
    }

    if (isEditMode) {
      setEditCoordinates(coords);
      setEditMapAddress('');
      void fetchAddress(coords, true);
      return;
    }

    setCoordinates(coords);
    setAddress('');
    void fetchAddress(coords, false);
  }, [fetchAddress, isEditMode, isModerator, setAddress, setCoordinates, setEditCoordinates, setEditMapAddress]);

  return { handleMapClick };
};
