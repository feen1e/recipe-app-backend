import {
  Controller,
  Delete,
  Get,
  Param,
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
import { RecipeResponseDto } from "../recipes/dto/recipe-response.dto";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@ApiTags("favorites")
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get(":username")
  @ApiOperation({ summary: "Get user favorites" })
  @ApiResponse({
    status: 200,
    description: "List of user favorites",
    isArray: true,
    type: RecipeResponseDto,
  })
  async getUserFavorites(@Param("username") username: string) {
    return this.favoritesService.getUserFavorites(username);
  }

  @Post(":recipeId")
  @ApiOperation({ summary: "Add a recipe to favorites" })
  @ApiResponse({
    status: 201,
    description: "The recipe has been successfully added to favorites.",
  })
  @ApiResponse({
    status: 404,
    description: "User or Recipe not found.",
  })
  @UseGuards(AuthGuard)
  async addFavorite(
    @Param("recipeId") recipeId: string,
    @Req() request: RequestWithUser,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    const userId = request.user.id;
    return this.favoritesService.addFavorite(userId, recipeId);
  }

  @Delete(":recipeId")
  @ApiOperation({ summary: "Remove a recipe from favorites" })
  @ApiResponse({
    status: 200,
    description: "The recipe has been successfully removed from favorites.",
  })
  @UseGuards(AuthGuard)
  async removeFavorite(
    @Param("recipeId") recipeId: string,
    @Req() request: RequestWithUser,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    const userId = request.user.id;
    return this.favoritesService.removeFavorite(userId, recipeId);
  }
}
