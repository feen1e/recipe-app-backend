import { Role } from "@prisma/client";
import { UserMetadata } from "src/users/dto/user-metadata.dto";

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";
import { RatingCreateDto } from "./dto/rating-create.dto";
import {
  RatingResponseDto,
  ratingToResponseDto,
} from "./dto/rating-response.dto";
import { RatingUpdateDto } from "./dto/rating-update.dto";

@Injectable()
export class RatingsService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getAllRatings(): Promise<RatingResponseDto[]> {
    const ratings = await this.prisma.rating.findMany();
    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return ratings.map((rating) => ratingToResponseDto(rating, appUrl));
  }

  async getUserRatings(username: string): Promise<RatingResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user === null) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    const ratings = await this.prisma.rating.findMany({
      where: { userId: user.id },
    });

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return ratings.map((rating) => ratingToResponseDto(rating, appUrl));
  }

  async getRatingById(id: string): Promise<RatingResponseDto> {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (rating === null) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return ratingToResponseDto(rating, appUrl);
  }

  async createRating(
    dto: RatingCreateDto,
    authorId: string,
  ): Promise<RatingResponseDto> {
    const newRating = await this.prisma.rating.create({
      data: {
        stars: dto.stars,
        rewiev: dto.review, //not sure how to fix this error
        userId: authorId,
        recipeId: dto.recipeId,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      },
    });

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return ratingToResponseDto(newRating, appUrl);
  }

  async updateRating(
    currentUser: UserMetadata,
    id: string,
    dto: RatingUpdateDto,
  ) {
    const existingRating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (existingRating === null) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    if (
      existingRating.userId !== currentUser.id &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "You do not have permission to update this rating",
      );
    }

    const updatedData: {
      stars?: number;
      review?: string;
      userId?: string;
      recipeId?: string;
      createdAt?: Date;
      updatedAt?: Date;
    } = {};

    if (dto.stars !== undefined) {
      updatedData.stars = dto.stars;
    }
    if (dto.review !== undefined) {
      updatedData.review = dto.review;
    }
    if (dto.userId !== undefined) {
      updatedData.userId = dto.userId;
    }
    if (dto.recipeId !== undefined) {
      updatedData.recipeId = dto.recipeId;
    }
    if (dto.createdAt !== undefined) {
      updatedData.createdAt = dto.createdAt;
    }
    if (dto.updatedAt !== undefined) {
      updatedData.updatedAt = dto.updatedAt;
    }

    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: updatedData,
    });

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return ratingToResponseDto(updatedRating, appUrl);
  }

  async deleteRating(user: UserMetadata, id: string) {
    const existingRating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (existingRating === null) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    if (existingRating.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to delete this rating",
      );
    }

    await this.prisma.rating.delete({
      where: { id },
    });

    return { message: `Rating with ID ${id} has been deleted` };
  }
}
