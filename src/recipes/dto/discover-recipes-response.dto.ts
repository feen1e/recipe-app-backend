import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DiscoverRecipeAuthorDto {
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

export class DiscoverRecipeDto {
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

  @ApiPropertyOptional({
    description: "Recipe image URL",
    example: "https://example.com/uploads/recipes/pasta.jpg",
  })
  imageUrl?: string;

  @ApiProperty({
    description: "Recipe author information",
    type: DiscoverRecipeAuthorDto,
  })
  author: DiscoverRecipeAuthorDto;
}

export class DiscoverRecipesResponseDto {
  @ApiProperty({
    description: "List of random recipes for discovery",
    type: DiscoverRecipeDto,
    isArray: true,
  })
  recipes: DiscoverRecipeDto[];

  @ApiProperty({
    description: "Total number of recipes returned",
    example: 10,
  })
  count: number;
}
