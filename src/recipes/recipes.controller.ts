import {
  Body,
  Controller,
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
import { RecipeCreateDto } from "./dto/recipe-create.dto";
import { RecipeResponseDto } from "./dto/recipe-response.dto";
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
      throw new UnauthorizedException("User not found in request");
    }
    return this.recipesService.createRecipe(dto, request.user.id);
  }
}
