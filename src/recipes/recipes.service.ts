import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { RecipeCreateDto } from "./dto/recipe-create.dto";
import {
  RecipeResponseDto,
  recipeToResponseDto,
} from "./dto/recipe-response.dto";
import { parseArrayToJson } from "./utils/json-parse";

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    const recipes = await this.prisma.recipe.findMany();
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
    const ingredientsJson = parseArrayToJson(dto.ingredients) ?? [];
    const stepsJson = parseArrayToJson(dto.steps) ?? [];

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
}
