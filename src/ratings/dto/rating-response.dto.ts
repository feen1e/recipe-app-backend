import type { Rating } from "@prisma/client";

export class RatingResponseDto {
  id: string;
  stars: number;
  rewiev: string | null;
  userId: string;
  recipeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function ratingToResponseDto(
  rating: Rating,
  appUrl: string,
): RatingResponseDto {
  return {
    id: rating.id,
    stars: rating.stars,
    rewiev: rating.review,
    userId: rating.userId,
    recipeId: rating.recipeId,
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
  };
}
