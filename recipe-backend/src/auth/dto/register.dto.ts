import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: "john_doe" })
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ example: "john_doe@example.com" })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({ example: "password123" })
  password: string;
}
