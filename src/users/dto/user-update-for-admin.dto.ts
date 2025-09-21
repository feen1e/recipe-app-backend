import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class UserUpdateForAdminDto {
  @ApiPropertyOptional({
    description: "The user's username",
    example: "john_doe",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: "The user's email address",
    example: "john_doe@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "The user's bio",
    example: "Hello, I am John Doe.",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "The user's role, either 'USER' or 'ADMIN'",
    example: "USER",
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: "The URL of the user's avatar",
    example: "avatars/john_doe.jpg",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
