import type { BuildingDetails, Review } from '../types';

export const getBuildingAccessibility = (building: BuildingDetails): string[] =>
  [
    building.sign_language ? 'Русский жестовый язык' : null,
    building.subtitles ? 'Субтитры' : null,
    building.ramps ? 'Наличие пандусов' : null,
    building.braille ? 'Шрифт Брайля / сопровождение для слепых' : null,
  ].filter(Boolean) as string[];

export const getRatingSummary = (
  building: BuildingDetails,
  reviews: Review[],
): { averageRating: number; totalRatingCount: number } => {
  const normalizedRatings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

  const ratingCount = normalizedRatings.length;
  const averageRating = ratingCount
    ? Number((normalizedRatings.reduce((sum, rating) => sum + rating, 0) / ratingCount).toFixed(1))
    : Number(building.rating_avg || 0);

  return {
    averageRating,
    totalRatingCount: building.rating_count ?? ratingCount,
  };
};
