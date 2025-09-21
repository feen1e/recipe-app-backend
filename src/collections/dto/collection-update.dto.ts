import { IsOptional, IsString, MaxLength } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class CollectionUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: "The name of the collection",
    example: "Italian Recipes",
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: "A brief description of the collection",
    example: "A collection of my favorite Italian recipes.",
  })
  description?: string;
}
