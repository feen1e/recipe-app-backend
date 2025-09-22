import { User } from "@prisma/client";

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { RegisterDto } from "../auth/dto/register.dto";
import { PrismaService } from "../prisma/prisma.service";
import { UploadsService } from "../uploads/uploads.service";
import { UserMetadata, userToMetadata } from "./dto/user-metadata.dto";
import { UserResponseDto, userToResponseDto } from "./dto/user-response.dto";
import { UserUpdateForAdminDto } from "./dto/user-update-for-admin.dto";
import { UserUpdateDto } from "./dto/user-update.dto";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private uploadsService: UploadsService,
  ) {}

  async create(dto: RegisterDto) {
    try {
      return await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: dto.password,
        },
      });
    } catch {
      throw new BadRequestException("Invalid request data");
    }
  }

  async findOne(identifier: string): Promise<User | null> {
    const isEmail = identifier.includes("@");
    return this.prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
    });
  }

  async getUserMetadata(sub: string, email: string): Promise<UserMetadata> {
    const user = await this.prisma.user.findUnique({
      where: { id: sub, email },
    });

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return userToMetadata(user);
  }

  async getUserProfile(targetEmail: string): Promise<UserResponseDto> {
    const user = await this.findOne(targetEmail);

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return this.prepareUserResponse(user);
  }

  async updateUserData(
    currentUser: UserMetadata,
    dto: UserUpdateDto,
  ): Promise<UserResponseDto> {
    const targetUser: User | null = await this.findOne(currentUser.email);

    if (targetUser === null) {
      throw new NotFoundException("User not found");
    }

    const isExistingUsername =
      (await this.findOne(dto.username ?? "")) !== null;

    if (
      dto.username !== undefined &&
      isExistingUsername &&
      dto.username !== targetUser.username
    ) {
      throw new ForbiddenException("Username is already taken");
    }

    if (
      dto.avatarUrl != null &&
      targetUser.avatarUrl != null &&
      dto.avatarUrl !== targetUser.avatarUrl
    ) {
      await this.uploadsService.deleteFile(targetUser.avatarUrl);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUser.id },
      data: {
        username: dto.username,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
    });

    return this.prepareUserResponse(updatedUser);
  }

  async updateUserForAdmin(
    dto: UserUpdateForAdminDto,
    targetEmail: string,
  ): Promise<UserResponseDto> {
    const targetUser: User | null = await this.findOne(targetEmail);

    if (targetUser === null) {
      throw new NotFoundException("User not found");
    }

    const isExistingUsername =
      (await this.findOne(dto.username ?? "")) !== null;
    const isExistingEmail = (await this.findOne(dto.email ?? "")) !== null;

    if (
      dto.username !== undefined &&
      isExistingUsername &&
      dto.username !== targetUser.username
    ) {
      throw new ForbiddenException("Username is already taken");
    }

    if (
      dto.email !== undefined &&
      isExistingEmail &&
      dto.email !== targetUser.email
    ) {
      throw new ForbiddenException("Email is already taken");
    }

    if (
      dto.avatarUrl != null &&
      targetUser.avatarUrl != null &&
      dto.avatarUrl !== targetUser.avatarUrl
    ) {
      await this.uploadsService.deleteFile(targetUser.avatarUrl);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUser.id },
      data: {
        username: dto.username,
        email: dto.email,
        bio: dto.bio,
        role: dto.role,
        avatarUrl: dto.avatarUrl,
      },
    });

    return this.prepareUserResponse(updatedUser);
  }

  private prepareUserResponse(updatedUser: User): UserResponseDto {
    const appUrl = this.configService.get<string>("APP_URL");
    if (appUrl === undefined) {
      throw new Error("APP_URL is not defined in the environment variables");
    }
    return userToResponseDto(updatedUser, appUrl);
  }

  async getUser(username: string) {
    const foundUser = await this.findOne(username);
    if (foundUser === null) {
      throw new NotFoundException("User not found");
    }

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return userToResponseDto(foundUser, appUrl);
  }
}
