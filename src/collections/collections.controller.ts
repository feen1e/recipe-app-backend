import { CollectionRecipe } from "@prisma/client";

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
import { CollectionsService } from "./collections.service";
import { AddRecipeToCollectionDto } from "./dto/add-recipe-to-collection.dto";
import { CollectionCreateDto } from "./dto/collection-create.dto";
import { CollectionUpdateDto } from "./dto/collection-update.dto";

@Controller("collections")
@ApiTags("collections")
@ApiBearerAuth()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: "Get all collections" })
  @ApiResponse({ status: 200, description: "List of all collections" })
  async getAllCollections() {
    return this.collectionsService.getAllCollections();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get collection with recipes by ID" })
  @ApiResponse({ status: 200, description: "Collection found" })
  @ApiResponse({ status: 404, description: "Collection not found" })
  async getCollectionById(@Param("id") id: string) {
    return this.collectionsService.getCollectionWithRecipes(id);
  }

  @Get("user/:username")
  @ApiOperation({ summary: "Get collections by username" })
  @ApiResponse({ status: 200, description: "List of user collections" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserCollections(@Param("username") username: string) {
    return this.collectionsService.getUserCollections(username);
  }

  @Post()
  @ApiOperation({ summary: "Create a new collection" })
  @ApiResponse({ status: 201, description: "Collection created successfully" })
  @ApiResponse({ status: 401, description: "User not authenticated" })
  @UseGuards(AuthGuard)
  async createCollection(
    @Req() request: RequestWithUser,
    @Body() dto: CollectionCreateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.collectionsService.createCollection(request.user.id, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a collection" })
  @ApiResponse({ status: 200, description: "Collection updated successfully" })
  @ApiResponse({ status: 401, description: "User not authenticated" })
  @ApiResponse({
    status: 403,
    description: "User not authorized to update this collection",
  })
  @ApiResponse({ status: 404, description: "Collection not found" })
  @UseGuards(AuthGuard)
  async updateCollection(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Body() dto: CollectionUpdateDto,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.collectionsService.updateCollection(request.user, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a collection" })
  @ApiResponse({ status: 200, description: "Collection deleted successfully" })
  @ApiResponse({ status: 401, description: "User not authenticated" })
  @ApiResponse({
    status: 403,
    description: "User not authorized to delete this collection",
  })
  @ApiResponse({ status: 404, description: "Collection not found" })
  @UseGuards(AuthGuard)
  async deleteCollection(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
  ) {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.collectionsService.deleteCollection(request.user, id);
  }

  @Post(":id/recipes")
  @ApiOperation({ summary: "Add a recipe to a collection" })
  @ApiResponse({ status: 201, description: "Recipe added to collection" })
  @ApiResponse({ status: 401, description: "User not authenticated" })
  @ApiResponse({
    status: 403,
    description: "Not authorized to modify this collection",
  })
  @ApiResponse({ status: 404, description: "Collection not found" })
  @UseGuards(AuthGuard)
  async addRecipeToCollection(
    @Req() request: RequestWithUser,
    @Param("id") collectionId: string,
    @Body() dto: AddRecipeToCollectionDto,
  ): Promise<CollectionRecipe> {
    if (request.user == null) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.collectionsService.addRecipeToCollection(
      request.user,
      collectionId,
      dto.recipeId,
    );
  }
}
