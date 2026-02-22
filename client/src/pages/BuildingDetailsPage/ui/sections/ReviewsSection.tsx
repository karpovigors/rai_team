import React from 'react';
import type { Review } from '../../model/types';

interface ReviewsSectionProps {
  isAuthenticated: boolean;
  isModerator: boolean;
  currentUsername: string | null;
  newReviewText: string;
  newReviewRating: number;
  reviews: Review[];
  onSubmit: (e: React.FormEvent) => void;
  onDeleteReview: (reviewId: number) => void;
  onReviewTextChange: (value: string) => void;
  onReviewRatingChange: (value: number) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  isAuthenticated,
  isModerator,
  currentUsername,
  newReviewText,
  newReviewRating,
  reviews,
  onSubmit,
  onDeleteReview,
  onReviewTextChange,
  onReviewRatingChange,
}) => (
  <div className="reviews-section">
    {isAuthenticated ? (
      <form className="review-form" onSubmit={onSubmit}>
        <div className="review-rating-picker" role="group" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`rating-star-button ${value <= newReviewRating ? 'active' : ''}`}
              onClick={() => onReviewRatingChange(value)}
              aria-label={`Оценка ${value} из 5`}
              title={`${value} из 5`}
            >
              ★
            </button>
          ))}
          <span className="review-rating-value">{newReviewRating}/5</span>
        </div>
        <textarea
          className="review-textarea"
          placeholder="Напишите отзыв"
          value={newReviewText}
          onChange={(e) => onReviewTextChange(e.target.value)}
          rows={4}
          required
        />
        <button type="submit" className="review-submit-button">Отправить отзыв</button>
      </form>
    ) : (
      <div className="review-auth-required">
        Для написания отзыва нужна авторизация. <a href="/auth">Войти</a>
      </div>
    )}

    {reviews.map((review) => (
      <div className="review" key={review.id}>
        <div className="review-user-info">
          <div className="review-user-meta">
            <div className="review-user-icon"></div>
            <p className="review-user">{review.author}</p>
          </div>
          {(isModerator || (currentUsername && currentUsername === review.author)) && (
            <button
              type="button"
              className="review-delete-button"
              onClick={() => onDeleteReview(review.id)}
              title={isModerator ? 'Удалить отзыв (модератор)' : 'Удалить свой отзыв'}
            >
              Удалить
            </button>
          )}
        </div>
        <p className="review-rating">
          {'★'.repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}
          {'☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, Number(review.rating) || 0))))}
        </p>
        <p className="review-text">{review.text}</p>
      </div>
    ))}
  </div>
);
