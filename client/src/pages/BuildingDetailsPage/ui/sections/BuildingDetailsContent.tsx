import React from 'react';
import type { BuildingDetails, Review } from '../../model/types';
import { getBuildingAccessibility, getRatingSummary } from '../../model/lib/buildingDetailsViewModel';
import { BuildingTitleSection } from './BuildingTitleSection';
import { EditBuildingForm } from './EditBuildingForm';
import { BuildingInfoSection } from './BuildingInfoSection';
import { ReviewsSection } from './ReviewsSection';

interface BuildingDetailsContentProps {
  building: BuildingDetails;
  reviews: Review[];
  isModerator: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  editFormProps: React.ComponentProps<typeof EditBuildingForm>;
  infoSectionProps: Omit<React.ComponentProps<typeof BuildingInfoSection>, 'building' | 'accessibility' | 'isModerator'>;
  reviewsSectionProps: Omit<React.ComponentProps<typeof ReviewsSection>, 'reviews'>;
}

export const BuildingDetailsContent: React.FC<BuildingDetailsContentProps> = ({
  building,
  reviews,
  isModerator,
  isEditMode,
  onToggleEditMode,
  editFormProps,
  infoSectionProps,
  reviewsSectionProps,
}) => {
  const accessibility = getBuildingAccessibility(building);
  const { averageRating, totalRatingCount } = getRatingSummary(building, reviews);

  return (
    <>
      <BuildingTitleSection
        title={building.title}
        averageRating={averageRating}
        totalRatingCount={totalRatingCount}
        isModerator={isModerator}
        isEditMode={isEditMode}
        onToggleEditMode={onToggleEditMode}
      />

      {isModerator && isEditMode && <EditBuildingForm {...editFormProps} />}

      <BuildingInfoSection
        building={building}
        accessibility={accessibility}
        isModerator={isModerator}
        {...infoSectionProps}
      />

      <ReviewsSection reviews={reviews} {...reviewsSectionProps} />
    </>
  );
};
