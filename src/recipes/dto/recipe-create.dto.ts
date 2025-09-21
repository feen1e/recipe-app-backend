import { IsNotEmpty, IsOptional, IsString } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RecipeCreateDto {
  @ApiProperty({
    description: "The title of the recipe",
    example: "Spaghetti Carbonara",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: "A brief description of the recipe",
    example:
      "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "The ingredients for the recipe",
    example: ["spaghetti", "eggs", "cheese", "pancetta", "pepper"],
    isArray: true,
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients: string[];

  @ApiProperty({
    description: "The steps to prepare the recipe",
    example: ["Boil water", "Cook spaghetti", "Mix ingredients"],
    isArray: true,
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  steps: string[];

  @ApiPropertyOptional({
    description: "The URL of the recipe image",
    example: "recipes/spaghetti_carbonara.jpg",
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
