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
import { RecipeCreateDto } from "./dto/recipe-create.dto";
import { RecipeResponseDto } from "./dto/recipe-response.dto";
import { RecipeUpdateDto } from "./dto/recipe-update.dto";
import { RecipesService } from "./recipes.service";

@Controller("recipes")
@ApiTags("recipes")
@ApiBearerAuth()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}
  @Get()
  @ApiOperation({ summary: "Get all recipes" })
  @ApiResponse({
    status: 200,
    description: "List of all recipes",
    isArray: true,
    type: RecipeResponseDto,
  })
  async getAllRecipes() {
    return this.recipesService.getAllRecipes();
  }

  @Get("user/:username")
  @ApiOperation({ summary: "Get recipes by user ID" })
  @ApiResponse({
    status: 200,
    description: "List of recipes by the specified user",
    isArray: true,
    type: RecipeResponseDto,
  })
  async getUserRecipes(@Param("username") username: string) {
    return this.recipesService.getUserRecipes(username);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get recipe by ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe found",
    type: RecipeResponseDto,
  })
  async getRecipeById(@Param("id") id: string) {
    return this.recipesService.getRecipeById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create a new recipe" })
  @ApiResponse({
    status: 201,
    description: "The recipe has been successfully created.",
    type: RecipeResponseDto,
  })
  async createRecipe(
    @Req() request: RequestWithUser,
    @Body() dto: RecipeCreateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.recipesService.createRecipe(dto, request.user.id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Update a recipe" })
  @ApiResponse({
    status: 200,
    description: "The recipe has been successfully updated.",
    type: RecipeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Recipe not found",
  })
  @ApiResponse({
    status: 403,
    description: "You do not have permission to update this recipe",
  })
  async updateRecipe(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Body() dto: RecipeUpdateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.recipesService.updateRecipe(request.user, id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a recipe" })
  @ApiResponse({
    status: 200,
    description: "The recipe has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Recipe not found",
  })
  @ApiResponse({
    status: 403,
    description: "You do not have permission to delete this recipe",
  })
  async deleteRecipe(@Req() request: RequestWithUser, @Param("id") id: string) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.recipesService.deleteRecipe(request.user, id);
  }
}
