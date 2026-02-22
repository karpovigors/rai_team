import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { BuildingListItem } from './types';

interface UseBuildingsResult {
  buildings: BuildingListItem[];
  isLoading: boolean;
  loadError: string;
  reload: () => Promise<void>;
}

export const useBuildings = (): UseBuildingsResult => {
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const apiBaseUrl = useMemo(
    () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
    [],
  );

  const loadBuildings = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const { data } = await axios.get<BuildingListItem[]>(`${apiBaseUrl}/api/objects`);
      setBuildings(data);
    } catch {
      setLoadError('Не удалось загрузить список объектов');
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void loadBuildings();
  }, [loadBuildings]);

  return {
    buildings,
    isLoading,
    loadError,
    reload: loadBuildings,
  };
};

