import React from 'react';

interface BuildingTitleSectionProps {
  title: string;
  averageRating: number;
  totalRatingCount: number;
  isModerator: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export const BuildingTitleSection: React.FC<BuildingTitleSectionProps> = ({
  title,
  averageRating,
  totalRatingCount,
  isModerator,
  isEditMode,
  onToggleEditMode,
}) => (
  <div className="building-title">
    <h2>{title}</h2>
    <div className="building-rating-summary">
      <span className="building-rating-stars">
        {'★'.repeat(Math.round(averageRating))}
        {'☆'.repeat(Math.max(0, 5 - Math.round(averageRating)))}
      </span>
      <span className="building-rating-value">{averageRating.toFixed(1)} / 5</span>
      <span className="building-rating-count">({totalRatingCount} оценок)</span>
    </div>
    {isModerator && (
      <button type="button" className="details-edit-button" onClick={onToggleEditMode}>
        {isEditMode ? 'Скрыть редактирование' : 'Редактировать объект'}
      </button>
    )}
  </div>
);

