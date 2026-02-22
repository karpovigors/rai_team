import React from 'react';
import type { BuildingListItem } from '../../model/types';

interface BuildingsListProps {
  buildings: BuildingListItem[];
  isLoading: boolean;
  loadError: string;
}

export const BuildingsList: React.FC<BuildingsListProps> = ({
  buildings,
  isLoading,
  loadError,
}) => (
  <div className="buildings-list">
    {isLoading && <div>Загрузка...</div>}
    {loadError && <div>{loadError}</div>}
    {!isLoading && !loadError && buildings.map((building) => (
      <a href={`/building/${building.id}`} className="building-card" key={building.id}>
        <img src={building.image_url} alt={building.title} />
        <h3>{building.title}</h3>
        <ul>
          {building.schedule && <li>{building.schedule}</li>}
          {building.address && <li>{building.address}</li>}
          {Array.isArray(building.metros) && building.metros.length > 0 && (
            <li>{building.metros.join(', ')}</li>
          )}
        </ul>
        <div className="building-icons"></div>
      </a>
    ))}
    {!isLoading && !loadError && buildings.length === 0 && (
      <div>Ничего не найдено по текущим фильтрам</div>
    )}
  </div>
);
