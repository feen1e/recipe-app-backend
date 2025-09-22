import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CollectionCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: "The name of the collection",
    example: "Italian Recipes",
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: "A brief description of the collection",
    example: "A collection of my favorite Italian recipes.",
  })
  description?: string;
}
