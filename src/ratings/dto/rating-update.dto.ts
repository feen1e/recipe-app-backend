import { IsOptional, IsString } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class RatingUpdateDto {
  @ApiPropertyOptional({
    description: "The amount of stars 1-5",
    example: 5,
  })
  stars?: number;

  @ApiPropertyOptional({
    description: "A brief, and optional, review of the recipe",
    example:
      "This is the best recipe for chocholate cupcakes, they taste like heaven!",
  })
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({
    description: "Id of the creator of the rating",
    example: "123456",
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: "Id of the recipe",
    example: "123456",
  })
  @IsString()
  @IsOptional()
  recipeId?: string;

  @ApiPropertyOptional({
    description: "When the review was created",
  })
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: "When was the review last updated",
  })
  @IsOptional()
  updatedAt?: Date;
}
