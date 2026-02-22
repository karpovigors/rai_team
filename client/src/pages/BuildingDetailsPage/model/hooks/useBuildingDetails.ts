import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { BuildingDetails } from '../types';
import { getBuildingDetails } from '../../api/buildingDetailsApi';

interface UseBuildingDetailsResult {
  building: BuildingDetails | null;
  isLoading: boolean;
  loadError: string;
  reload: () => Promise<void>;
  setBuilding: Dispatch<SetStateAction<BuildingDetails | null>>;
}

export const useBuildingDetails = (buildingId: number): UseBuildingDetailsResult => {
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadBuilding = useCallback(async () => {
    if (!Number.isFinite(buildingId)) {
      setLoadError('Некорректный идентификатор объекта');
      setBuilding(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getBuildingDetails(buildingId);
      setBuilding(data);
    } catch {
      setLoadError('Не удалось загрузить данные объекта');
      setBuilding(null);
    } finally {
      setIsLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    void loadBuilding();
  }, [loadBuilding]);

  return {
    building,
    isLoading,
    loadError,
    reload: loadBuilding,
    setBuilding,
  };
};
