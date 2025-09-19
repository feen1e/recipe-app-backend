import { Role } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { UserMetadata } from "src/users/dto/user-metadata.dto";

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { RecipeCreateDto } from "./dto/recipe-create.dto";
import {
  RecipeResponseDto,
  recipeToResponseDto,
} from "./dto/recipe-response.dto";
import { RecipeUpdateDto } from "./dto/recipe-update.dto";
import { parseArrayToJson } from "./utils/json-parse";

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    const recipes = await this.prisma.recipe.findMany();
    return recipes.map((recipe) => recipeToResponseDto(recipe));
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

    return recipes.map((recipe) => recipeToResponseDto(recipe));
  }

  async getRecipeById(id: string): Promise<RecipeResponseDto> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (recipe === null) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipeToResponseDto(recipe);
  }

  async createRecipe(
    dto: RecipeCreateDto,
    authorId: string,
  ): Promise<RecipeResponseDto> {
    const ingredientsJson = parseArrayToJson(dto.ingredients);
    const stepsJson = parseArrayToJson(dto.steps);

    const newRecipe = await this.prisma.recipe.create({
      data: {
        authorId,
        title: dto.title,
        description: dto.description,
        ingredients: ingredientsJson,
        steps: stepsJson,
        imageUrl: dto.imageUrl,
      },
    });

    return recipeToResponseDto(newRecipe);
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

    return recipeToResponseDto(updatedRecipe);
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
}
