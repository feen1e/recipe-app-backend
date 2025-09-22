import { Recipe, Role } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { UserMetadata } from "src/users/dto/user-metadata.dto";

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";
import { DiscoverRecipesQueryDto } from "./dto/discover-recipes-query.dto";
import {
  DiscoverRecipeDto,
  DiscoverRecipesResponseDto,
} from "./dto/discover-recipes-response.dto";
import { LatestRecipesQueryDto } from "./dto/latest-recipes-query.dto";
import {
  LatestRecipeResponseDto,
  LatestRecipesResponseDto,
} from "./dto/latest-recipes-response.dto";
import { RecipeCreateDto } from "./dto/recipe-create.dto";
import {
  RecipeResponseDto,
  recipeToResponseDto,
} from "./dto/recipe-response.dto";
import { RecipeUpdateDto } from "./dto/recipe-update.dto";
import { parseArrayFromJson, parseArrayToJson } from "./utils/json-parse";

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    const recipes = await this.prisma.recipe.findMany();
    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return recipes.map((recipe) => recipeToResponseDto(recipe, appUrl));
  }

  async getUserRecipes(username: string): Promise<RecipeResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user === null) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    const recipes = await this.prisma.recipe.findMany({
      where: { authorId: user.id },
    });

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return recipes.map((recipe) => recipeToResponseDto(recipe, appUrl));
  }

  async getRecipeById(id: string): Promise<RecipeResponseDto> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (recipe === null) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return recipeToResponseDto(recipe, appUrl);
  }

  async createRecipe(
    dto: RecipeCreateDto,
    authorId: string,
  ): Promise<RecipeResponseDto> {
    const ingredientsJson = parseArrayToJson(dto.ingredients);
    const stepsJson = parseArrayToJson(dto.steps);
    let recipe: Recipe;

    try {
      recipe = await this.prisma.recipe.create({
        data: {
          authorId,
          title: dto.title,
          description: dto.description,
          ingredients: ingredientsJson,
          steps: stepsJson,
          imageUrl: dto.imageUrl,
        },
      });
    } catch {
      throw new BadRequestException("Invalid recipe data");
    }

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return recipeToResponseDto(recipe, appUrl);
  }

  async updateRecipe(
    currentUser: UserMetadata,
    id: string,
    dto: RecipeUpdateDto,
  ) {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (existingRecipe === null) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    if (
      existingRecipe.authorId !== currentUser.id &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "You do not have permission to update this recipe",
      );
    }

    const updatedData: {
      title?: string;
      description?: string;
      ingredients?: InputJsonValue;
      steps?: InputJsonValue;
      imageUrl?: string;
    } = {};

    if (dto.title !== undefined) {
      updatedData.title = dto.title;
    }
    if (dto.description !== undefined) {
      updatedData.description = dto.description;
    }
    if (dto.ingredients !== undefined) {
      updatedData.ingredients = parseArrayToJson(dto.ingredients);
    }
    if (dto.steps !== undefined) {
      updatedData.steps = parseArrayToJson(dto.steps);
    }
    if (dto.imageUrl !== undefined) {
      updatedData.imageUrl = dto.imageUrl;
    }

    const updatedRecipe = await this.prisma.recipe.update({
      where: { id },
      data: updatedData,
    });

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return recipeToResponseDto(updatedRecipe, appUrl);
  }

  async deleteRecipe(user: UserMetadata, id: string) {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (existingRecipe === null) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    if (existingRecipe.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to delete this recipe",
      );
    }

    await this.prisma.recipe.delete({
      where: { id },
    });

    return { message: `Recipe with ID ${id} has been deleted` };
  }

  async getLatestRecipes(
    query: LatestRecipesQueryDto,
  ): Promise<LatestRecipesResponseDto> {
    const { cursor, limit = 10 } = query;

    let where = {};
    if (cursor !== undefined && cursor.length > 0) {
      const cursorRecipeUpdatedAt = await this.getRecipeUpdatedAt(cursor);
      where = { updatedAt: { lt: cursorRecipeUpdatedAt } };
    }

    const recipes = await this.prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit + 1,
    });

    const hasMore = recipes.length > limit;
    const recipesToReturn = hasMore ? recipes.slice(0, limit) : recipes;

    const nextCursor = hasMore ? recipesToReturn.at(-1)?.id : undefined;

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    const latestRecipes: LatestRecipeResponseDto[] = recipesToReturn.map(
      (recipe) => {
        const ingredients: string[] = parseArrayFromJson(recipe.ingredients);
        const steps: string[] = parseArrayFromJson(recipe.steps);
        const imageUrl =
          recipe.imageUrl === null
            ? undefined
            : `${appUrl}/uploads/${recipe.imageUrl}`;

        let avatarUrl: string | undefined;
        if (
          recipe.author.avatarUrl !== null &&
          recipe.author.avatarUrl.length > 0
        ) {
          avatarUrl = `${appUrl}/uploads/${recipe.author.avatarUrl}`;
        }

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? undefined,
          ingredients,
          steps,
          imageUrl,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
          author: {
            username: recipe.author.username,
            avatarUrl,
          },
        };
      },
    );

    return {
      recipes: latestRecipes,
      nextCursor,
      hasMore,
    };
  }

  async discoverRecipes(
    userId: string,
    query: DiscoverRecipesQueryDto,
  ): Promise<DiscoverRecipesResponseDto> {
    const { limit = 10 } = query;

    const userFavorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { recipeId: true },
    });
    const favoriteRecipeIds = userFavorites.map((fav) => fav.recipeId);

    const userCollectionRecipes = await this.prisma.collectionRecipe.findMany({
      where: {
        collection: {
          userId,
        },
      },
      select: { recipeId: true },
    });
    const collectionRecipeIds = userCollectionRecipes.map((cr) => cr.recipeId);

    const excludeRecipeIds = [...favoriteRecipeIds, ...collectionRecipeIds];

    const recipes = await this.prisma.recipe.findMany({
      where: {
        AND: [
          { authorId: { not: userId } },
          { id: { notIn: excludeRecipeIds } },
        ],
      },
      include: {
        author: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit * 3,
    });

    const shuffledRecipes = recipes
      .toSorted(() => 0.5 - Math.random())
      .slice(0, limit);

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    const discoverRecipes: DiscoverRecipeDto[] = shuffledRecipes.map(
      (recipe) => {
        const imageUrl =
          recipe.imageUrl === null
            ? undefined
            : `${appUrl}/uploads/${recipe.imageUrl}`;

        let avatarUrl: string | undefined;
        if (
          recipe.author.avatarUrl !== null &&
          recipe.author.avatarUrl.length > 0
        ) {
          avatarUrl = `${appUrl}/uploads/${recipe.author.avatarUrl}`;
        }

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? undefined,
          imageUrl,
          author: {
            username: recipe.author.username,
            avatarUrl,
          },
        };
      },
    );

    return {
      recipes: discoverRecipes,
      count: discoverRecipes.length,
    };
  }

  private async getRecipeUpdatedAt(recipeId: string): Promise<Date> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { updatedAt: true },
    });

    if (recipe === null) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    return recipe.updatedAt;
  }
}
