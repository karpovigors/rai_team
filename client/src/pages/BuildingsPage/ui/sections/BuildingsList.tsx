import React from 'react';
import type { BuildingListItem } from '../../model/types';

interface BuildingsListProps {
  buildings: BuildingListItem[];
  isLoading: boolean;
  loadError: string;
  screenReader?: boolean;
  onSpeakText?: (text: string) => void;
}

export const BuildingsList: React.FC<BuildingsListProps> = ({
  buildings,
  isLoading,
  loadError,
  screenReader = false,
  onSpeakText,
}) => {
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, building: BuildingListItem) => {
    if (screenReader && onSpeakText) {
      e.preventDefault();
      const text = `${building.title}. ${building.address}. ${building.schedule || ''}`;
      onSpeakText(text);
    }
  };

  const getAccessibilityIcons = (building: BuildingListItem) => {
    const icons: string[] = [];
    if (building.sign_language) icons.push('🤟');
    if (building.subtitles) icons.push('📝');
    if (building.ramps) icons.push('♿');
    if (building.braille) icons.push('⠂⠂');
    return icons;
  };

  return (
    <div className="buildings-list">
      {isLoading && <div>Загрузка...</div>}
      {loadError && <div>{loadError}</div>}
      {!isLoading && !loadError && buildings.map((building) => {
        const accessibilityIcons = getAccessibilityIcons(building);
        return (
          <a
            href={`/building/${building.id}`}
            className="building-card"
            key={building.id}
            onClick={(e) => handleCardClick(e, building)}
            role="link"
            aria-label={`${building.title}, ${building.address}`}
          >
            <img src={building.image_url} alt={building.title} />
            <h3>{building.title}</h3>
            <ul>
              {building.schedule && <li>{building.schedule}</li>}
              {building.address && <li>{building.address}</li>}
              {Array.isArray(building.metros) && building.metros.length > 0 && (
                <li>{building.metros.join(', ')}</li>
              )}
            </ul>
            <div className="building-icons">
              {accessibilityIcons.map((icon, index) => (
                <span key={index} className="accessibility-icon" title={getAccessibilityLabel(icon)}>
                  {icon}
                </span>
              ))}
            </div>
          </a>
        );
      })}
      {!isLoading && !loadError && buildings.length === 0 && (
        <div>Ничего не найдено по текущим фильтрам</div>
      )}
    </div>
  );
};

function getAccessibilityLabel(icon: string): string {
  switch (icon) {
    case '🤟':
      return 'Сурдоперевод';
    case '📝':
      return 'Субтитры';
    case '♿':
      return 'Пандусы';
    case '⠂⠂':
      return 'Шрифт Брайля';
    default:
      return '';
  }
}
