import { Role } from "@prisma/client";

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { RegisterDto } from "../auth/dto/register.dto";
import type { RequestWithUser } from "../auth/dto/request-with-user.dto";
import { Roles } from "../auth/roles/role.decorator";
import { RoleGuard } from "../auth/roles/role.guard";
import { UserUpdateForAdminDto } from "./dto/user-update-for-admin.dto";
import { UserUpdateDto } from "./dto/user-update.dto";
import { UsersService } from "./users.service";

@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createUser(dto: RegisterDto) {
    return this.usersService.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: "Update user data" })
  @ApiResponse({
    status: 200,
    description: "The user data has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({ status: 403, description: "Username is already taken." })
  @UseGuards(AuthGuard)
  async updateUser(
    @Req() request: RequestWithUser,
    @Body() dto: UserUpdateDto,
  ) {
    if (request.user === undefined) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.usersService.updateUserData(request.user, dto);
  }

  @Patch(":email")
  @ApiOperation({ summary: "Update user data by admin" })
  @ApiResponse({
    status: 200,
    description: "The user data has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({ status: 403, description: "Username or email already taken." })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateUserByAdmin(
    @Body() dto: UserUpdateForAdminDto,
    @Param("email") email: string,
  ) {
    return this.usersService.updateUserForAdmin(dto, email);
  }

  @Get(":username")
  @ApiOperation({ summary: "Get user profile by username" })
  @ApiResponse({ status: 200, description: "User found." })
  @ApiResponse({ status: 404, description: "User not found." })
  async getUser(@Param("username") username: string) {
    return this.usersService.findOne(username);
  }
}
