import { IsOptional, IsString } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class UserUpdateDto {
  @ApiPropertyOptional({
    description: "The user's username",
    example: "john_doe",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: "The user's bio",
    example: "Hello, I am John Doe.",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "The URL of the user's avatar",
    example: "/uploads/avatars/john_doe.jpg",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
