import {
  Body,
  Controller,
  Delete,
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
import type { RequestWithUser } from "../auth/dto/request-with-user.dto";
import { RatingCreateDto } from "./dto/rating-create.dto";
import { RatingResponseDto } from "./dto/rating-response.dto";
import { RatingUpdateDto } from "./dto/rating-update.dto";
import { RatingsService } from "./ratings.service";

@Controller("ratings")
@ApiTags("ratings")
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}
  @Get()
  @ApiOperation({ summary: "Get all ratings" })
  @ApiResponse({
    status: 200,
    description: "List of all ratings",
    isArray: true,
    type: RatingResponseDto,
  })
  async getAllRatings() {
    return this.ratingsService.getAllRatings();
  }

  @Get("user/:username")
  @ApiOperation({ summary: "Get ratings by user ID" })
  @ApiResponse({
    status: 200,
    description: "List of ratings by the specified user",
    isArray: true,
    type: RatingResponseDto,
  })
  async getUserRatings(@Param("username") username: string) {
    return this.ratingsService.getUserRatings(username);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get rating by ID" })
  @ApiResponse({
    status: 200,
    description: "Rating found",
    type: RatingResponseDto,
  })
  async getRatiogById(@Param("id") id: string) {
    return this.ratingsService.getRatingById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create a new rating" })
  @ApiResponse({
    status: 201,
    description: "The recipe has been successfully created.",
    type: RatingResponseDto,
  })
  async createRating(
    @Req() request: RequestWithUser,
    @Body() dto: RatingCreateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.ratingsService.createRating(dto, request.user.id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Update a rating" })
  @ApiResponse({
    status: 200,
    description: "The rating has been successfully updated.",
    type: RatingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Rating not found",
  })
  @ApiResponse({
    status: 403,
    description: "You do not have permission to update this rating",
  })
  async updateRating(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Body() dto: RatingUpdateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.ratingsService.updateRating(request.user, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a rating" })
  @ApiResponse({
    status: 200,
    description: "The rating has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Rating not found",
  })
  @ApiResponse({
    status: 403,
    description: "You do not have permission to delete this rating",
  })
  async deleteRating(@Req() request: RequestWithUser, @Param("id") id: string) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.ratingsService.deleteRating(request.user, id);
  }
}
