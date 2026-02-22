import { useMemo } from 'react';
import type { BuildingListItem } from '../types';

const normalizeText = (value: unknown): string =>
  String(value ?? '').trim().toLocaleLowerCase('ru-RU');

interface UseBuildingsViewParams {
  buildings: BuildingListItem[];
  searchQuery: string;
  selectedInfrastructureType: string;
}

interface UseBuildingsViewResult {
  infrastructureTypes: string[];
  filteredBuildings: BuildingListItem[];
}

export const useBuildingsView = ({
  buildings,
  searchQuery,
  selectedInfrastructureType,
}: UseBuildingsViewParams): UseBuildingsViewResult => {
  const infrastructureTypes = useMemo(
    () =>
      Array.from(
        new Set(
          buildings
            .map((building) => String(building.infrastructure_type || building.infrastructureType || '').trim())
            .filter(Boolean),
        ),
      ),
    [buildings],
  );

  const filteredBuildings = useMemo(() => {
    const query = normalizeText(searchQuery);
    const selectedType = normalizeText(selectedInfrastructureType);

    return buildings.filter((building) => {
      const buildingTitle = normalizeText(building.title || building.name);
      const buildingType = normalizeText(building.infrastructure_type || building.infrastructureType);
      const matchesTitle = !query || buildingTitle.includes(query);
      const matchesInfrastructureType = !selectedType || buildingType === selectedType;
      return matchesTitle && matchesInfrastructureType;
    });
  }, [buildings, searchQuery, selectedInfrastructureType]);

  return {
    infrastructureTypes,
    filteredBuildings,
  };
};
