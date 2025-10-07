import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { LoginResponseDto } from "./dto/login-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully registered.",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "User with given email or username already exists",
  })
  async register(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully logged in.",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Provided credentials are invalid",
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
