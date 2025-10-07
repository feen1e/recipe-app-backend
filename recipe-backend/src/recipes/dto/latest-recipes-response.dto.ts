import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthorDto {
  @ApiProperty({
    description: "Author's username",
    example: "johndoe",
  })
  username: string;

  @ApiPropertyOptional({
    description: "Author's avatar URL",
    example: "https://example.com/uploads/avatars/avatar.jpg",
  })
  avatarUrl?: string;
}

export class LatestRecipeResponseDto {
  @ApiProperty({
    description: "Recipe ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "Recipe title",
    example: "Delicious Pasta",
  })
  title: string;

  @ApiPropertyOptional({
    description: "Recipe description",
    example: "A delicious pasta recipe perfect for dinner",
  })
  description?: string;

  @ApiProperty({
    description: "Recipe ingredients",
    type: String,
    isArray: true,
    example: ["500g pasta", "2 tomatoes", "1 onion"],
  })
  ingredients: string[];

  @ApiProperty({
    description: "Recipe preparation steps",
    type: String,
    isArray: true,
    example: ["Boil water", "Cook pasta", "Prepare sauce"],
  })
  steps: string[];

  @ApiPropertyOptional({
    description: "Recipe image URL",
    example: "https://example.com/uploads/recipes/pasta.jpg",
  })
  imageUrl?: string;

  @ApiProperty({
    description: "Recipe creation date",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Recipe last update date",
    example: "2024-01-16T14:45:00.000Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Recipe author information",
    type: AuthorDto,
  })
  author: AuthorDto;
}

export class LatestRecipesResponseDto {
  @ApiProperty({
    description: "List of latest recipes",
    type: LatestRecipeResponseDto,
    isArray: true,
  })
  recipes: LatestRecipeResponseDto[];

  @ApiPropertyOptional({
    description:
      "Cursor for next page (recipe ID). If null, there are no more recipes.",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  nextCursor?: string;

  @ApiProperty({
    description: "Whether there are more recipes available",
    example: true,
  })
  hasMore: boolean;
}
