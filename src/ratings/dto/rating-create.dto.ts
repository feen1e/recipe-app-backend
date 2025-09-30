import {
  Allow,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RatingCreateDto {
  @Allow()
  @ApiProperty({
    description: "The amount of stars 1-5",
    example: 5,
  })
  stars: number;

  @ApiPropertyOptional({
    description: "A brief, and optional, review of the recipe",
    example:
      "This is the best recipe for chocholate cupcakes, they taste like heaven!",
  })
  @IsString()
  @IsOptional()
  review?: string;

  @ApiProperty({
    description: "Id of the creator of the rating",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Id of the recipe",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  recipeId: string;

  @Allow()
  @ApiProperty({
    description: "When the review was created",
  })
  @IsObject()
  createdAt: Date;

  @Allow()
  @ApiProperty({
    description: "When was the review last updated",
  })
  @IsObject()
  updatedAt: Date;
}
