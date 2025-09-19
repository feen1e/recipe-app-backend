import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { recipeToResponseDto } from "../recipes/dto/recipe-response.dto";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getUserFavorites(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user === null) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: { recipe: true },
    });
    return favorites.map((fav) => recipeToResponseDto(fav.recipe));
  }

  async addFavorite(userId: string, recipeId: string) {
    if (
      (await this.prisma.user.findUnique({ where: { id: userId } })) === null
    ) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (
      (await this.prisma.recipe.findUnique({ where: { id: recipeId } })) ===
      null
    ) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existingFavorite != null) {
      throw new ConflictException("Recipe is already in favorites");
    }

    return this.prisma.favorite.create({
      data: { userId, recipeId },
    });
  }

  async removeFavorite(userId: string, recipeId: string) {
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existingFavorite == null) {
      throw new NotFoundException("Favorite not found");
    }

    return this.prisma.favorite.delete({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });
  }
}
