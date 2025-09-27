import { Role } from "@prisma/client";
import { CollectionRecipe } from "@prisma/client";

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";
import { UserMetadata } from "../users/dto/user-metadata.dto";
import { UsersService } from "../users/users.service";
import { CollectionCreateDto } from "./dto/collection-create.dto";
import { CollectionResponseDto } from "./dto/collection-response.dto";
import { CollectionUpdateDto } from "./dto/collection-update.dto";
import {
  CollectionWithRecipesResponseDto,
  collectionToResponseDto,
} from "./dto/collection-with-recipes-response.dto";

@Injectable()
export class CollectionsService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async getAllCollections(): Promise<CollectionResponseDto[]> {
    const collections = await this.prisma.collection.findMany();
    return collections;
  }

  async getCollectionWithRecipes(
    id: string,
  ): Promise<CollectionWithRecipesResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (collection === null) {
      throw new NotFoundException("Collection not found");
    }

    const appUrl = this.configService.get<string>("APP_URL") ?? "";
    return collectionToResponseDto(collection, appUrl);
  }

  async getUserCollections(username: string): Promise<CollectionResponseDto[]> {
    const user = await this.userService.findOne(username);
    if (user === null) {
      throw new NotFoundException("User not found");
    }

    const collections = await this.prisma.collection.findMany({
      where: { userId: user.id },
    });

    return collections;
  }

  async createCollection(
    userId: string,
    dto: CollectionCreateDto,
  ): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
      },
    });
    return collection;
  }

  async updateCollection(
    user: UserMetadata,
    collectionId: string,
    dto: CollectionUpdateDto,
  ): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (collection === null) {
      throw new NotFoundException("Collection not found.");
    }

    if (collection.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to edit this collection.",
      );
    }

    const updatedCollection = await this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        name: dto.name ?? collection.name,
        description: dto.description ?? collection.description,
      },
    });

    return updatedCollection;
  }

  async deleteCollection(user: UserMetadata, collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (collection === null) {
      throw new NotFoundException("Collection not found.");
    }

    if (collection.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to delete this collection.",
      );
    }

    await this.prisma.collection.delete({
      where: { id: collectionId },
    });

    return { message: "Collection deleted successfully." };
  }

  async addRecipeToCollection(
    user: UserMetadata,
    collectionId: string,
    recipeId: string,
  ): Promise<CollectionRecipe> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (collection === null) {
      throw new NotFoundException("Collection not found.");
    }

    if (collection.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to modify this collection.",
      );
    }

    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (recipe === null) {
      throw new NotFoundException(
        `Recipe with ID: ${recipeId} does not exist.`,
      );
    }

    try {
      return await this.prisma.collectionRecipe.create({
        data: {
          collectionId,
          recipeId,
        },
      });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error) {
        throw new ConflictException(
          "Recipe already exists in this collection.",
        );
      }
      throw error;
    }
  }
}
