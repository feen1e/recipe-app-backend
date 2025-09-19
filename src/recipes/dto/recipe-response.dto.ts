import type { Recipe } from "@prisma/client";

import { parseArrayFromJson } from "../utils/json-parse";

export class RecipeResponseDto {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function recipeToResponseDto(recipe: Recipe): RecipeResponseDto {
  const ingredients: string[] = parseArrayFromJson(recipe.ingredients);
  const steps: string[] = parseArrayFromJson(recipe.steps);

  return {
    id: recipe.id,
    authorId: recipe.authorId,
    title: recipe.title,
    description: recipe.description ?? undefined,
    ingredients,
    steps,
    imageUrl: recipe.imageUrl ?? undefined,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}
