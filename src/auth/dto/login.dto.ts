import { IsNotEmpty, IsString, MinLength } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "The user's username or email address",
    example: "john_doe",
  })
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: "The user's password",
    example: "password123",
  })
  password: string;
}
