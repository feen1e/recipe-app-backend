import { IsOptional, IsString } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class RecipeUpdateDto {
  @ApiPropertyOptional({
    description: "The title of the recipe",
    example: "Spaghetti Carbonara",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "A brief description of the recipe",
    example:
      "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "The ingredients required for the recipe",
    example: [
      "200g spaghetti",
      "100g pancetta",
      "2 large eggs",
      "50g pecorino cheese",
      "50g parmesan cheese",
      "Freshly ground black pepper",
      "Salt",
    ],
    isArray: true,
  })
  @IsOptional()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiPropertyOptional({
    description: "The preparation steps for the recipe",
    example: [
      "Boil the spaghetti in salted water.",
      "Fry the pancetta until crispy.",
      "Beat the eggs and mix with the cheese.",
      "Combine spaghetti with pancetta and remove from heat.",
      "Quickly mix in the egg and cheese mixture.",
      "Serve immediately with extra cheese and pepper.",
    ],
    isArray: true,
  })
  @IsOptional()
  @IsString({ each: true })
  steps?: string[];

  @ApiPropertyOptional({
    description: "The image URL for the recipe",
    example: "/uploads/recipes/spaghetti-carbonara.jpg",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
