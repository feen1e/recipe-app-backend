import type { Collection, Recipe } from "@prisma/client";

import type { RecipeResponseDto } from "../../recipes/dto/recipe-response.dto";
import { recipeToResponseDto } from "../../recipes/dto/recipe-response.dto";

export class CollectionWithRecipesResponseDto {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  recipes: RecipeResponseDto[];
}

export interface CollectionWithRecipes extends Collection {
  recipes: {
    recipe: Recipe;
  }[];
}

export function collectionToResponseDto(
  collection: CollectionWithRecipes,
): CollectionWithRecipesResponseDto {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? undefined,
    userId: collection.userId,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    recipes: collection.recipes.map(({ recipe }) =>
      recipeToResponseDto(recipe),
    ),
  };
}
