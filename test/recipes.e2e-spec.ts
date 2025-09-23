import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthModule } from "../src/auth/auth.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import type { DiscoverRecipesResponseDto } from "../src/recipes/dto/discover-recipes-response.dto";
import type { LatestRecipesResponseDto } from "../src/recipes/dto/latest-recipes-response.dto";
import type { RecipeCreateDto } from "../src/recipes/dto/recipe-create.dto";
import type { RecipeResponseDto } from "../src/recipes/dto/recipe-response.dto";
import { RecipesModule } from "../src/recipes/recipes.module";
import { seedDatabase } from "./seed-database";
import { TestDataFactory } from "./test-data-factory";

describe("RecipesController (e2e)", () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let _adminEmail: string;
  let userToken: string;
  let _userEmail: string;
  let anotherUserToken: string;
  let _anotherUserEmail: string;
  let recipeId: string;

  beforeEach(async () => {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, ConfigModule, RecipesModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
      }),
    );

    await app.init();

    const tokens = await TestDataFactory.getAuthTokens(app);
    adminToken = tokens.adminToken;
    _adminEmail = tokens.adminEmail;
    userToken = tokens.userToken;
    _userEmail = tokens.userEmail;
    anotherUserToken = tokens.anotherUserToken;
    _anotherUserEmail = tokens.anotherUserEmail;

    recipeId = await TestDataFactory.getFirstRecipeId(app, userToken);
  });

  describe("GET /recipes", () => {
    it("should return all recipes", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const body = response.body as RecipeResponseDto[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      for (const recipe of body) {
        expect(recipe).toHaveProperty("id");
      }
    });
  });

  describe("GET user/:username", () => {
    it("should return recipes for a valid username", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/user/normal_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const body = response.body as RecipeResponseDto[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      for (const recipe of body) {
        expect(recipe).toHaveProperty("id");
      }
    });
    it("should return 200 and an empty array for a user who didn't create any recipes", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/user/admin_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      expect(response.body).toEqual([]);
    });
    it("should return 404 for a non-existing username", async () => {
      await request(app.getHttpServer())
        .get("/recipes/user/non_existing_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("GET /recipes/:id", () => {
    it("should return a recipe for a valid ID", async () => {
      const response = await request(app.getHttpServer())
        .get(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const body = response.body as RecipeResponseDto;
      expect(body).toHaveProperty("id", recipeId);
    });
    it("should return 404 for a non-existing recipe ID", async () => {
      await request(app.getHttpServer())
        .get("/recipes/non_existing_id")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("POST /recipes", () => {
    it("should create a new recipe with valid data", async () => {
      const newRecipe: RecipeCreateDto = {
        title: "New Recipe",
        description: "Delicious new recipe",
        ingredients: ["Ingredient 1", "Ingredient 2"],
        steps: ["Mix ingredients and cook"],
      };
      const response = await request(app.getHttpServer())
        .post("/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newRecipe)
        .expect(201);
      const body = response.body as RecipeResponseDto;
      expect(body).toHaveProperty("id");
      expect(body.title).toBe(newRecipe.title);
    });
    it("should return 400 for missing required fields", async () => {
      const incompleteRecipe = {
        title: "Incomplete Recipe",
      };
      await request(app.getHttpServer())
        .post("/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .send(incompleteRecipe)
        .expect(400);
    });
  });

  describe("PATCH /recipes/:id", () => {
    it("should return 200 for updating a recipe", async () => {
      const updateData = {
        title: "Updated Recipe Title",
      };
      const response = await request(app.getHttpServer())
        .patch(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);
      const body = response.body as RecipeResponseDto;
      expect(body).toHaveProperty("id", recipeId);
      expect(body.title).toBe(updateData.title);
    });
    it("should return 404 for updating a non-existing recipe", async () => {
      const updateData = {
        title: "Updated Recipe Title",
      };
      await request(app.getHttpServer())
        .patch("/recipes/non_existing_id")
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);
    });
    it("should return 403 when a user tries to update another user's recipe", async () => {
      const updateData = {
        title: "Malicious Update Attempt",
      };
      await request(app.getHttpServer())
        .patch(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send(updateData)
        .expect(403);
    });
    it("should let admin update recipe that doesn't belong to them", async () => {
      const updateData = {
        title: "Admin Update",
      };
      await request(app.getHttpServer())
        .patch(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
    });
  });

  describe("DELETE /recipes/:id", () => {
    it("should return 200 for deleting a recipe", async () => {
      await request(app.getHttpServer())
        .delete(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      // verifying that the recipe is actually deleted
      await request(app.getHttpServer())
        .get(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
    it("should return 404 when deleting a non-existing recipe", async () => {
      await request(app.getHttpServer())
        .delete("/recipes/non_existing_id")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
    it("should return 403 when a user tries to delete another user's recipe", async () => {
      await request(app.getHttpServer())
        .delete(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(403);
    });
    it("should let admin delete recipe that doesn't belong to them", async () => {
      await request(app.getHttpServer())
        .delete(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("GET /recipes/latest", () => {
    it("should return latest recipes with default pagination", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/latest")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const body = response.body as LatestRecipesResponseDto;
      expect(body).toHaveProperty("recipes");
      expect(body).toHaveProperty("hasMore");
      expect(Array.isArray(body.recipes)).toBe(true);
    });
    it("should return latest recipes with custom limit", async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/recipes/latest?limit=${limit.toString()}`)
        .expect(200);

      const body = response.body as LatestRecipesResponseDto;
      expect(body.recipes.length).toBeLessThanOrEqual(limit);
    });
    it("should handle cursor-based pagination", async () => {
      const firstResponse = await request(app.getHttpServer())
        .get("/recipes/latest?limit=1")
        .expect(200);
      const firstBody = firstResponse.body as LatestRecipesResponseDto;
      expect(firstBody.recipes.length).toBeLessThanOrEqual(1);

      if (firstBody.hasMore && firstBody.nextCursor !== undefined) {
        const secondResponse = await request(app.getHttpServer())
          .get(`/recipes/latest?cursor=${firstBody.nextCursor}&limit=1`)
          .expect(200);
        const secondBody = secondResponse.body as LatestRecipesResponseDto;
        expect(secondBody.recipes.length).toBeLessThanOrEqual(1);

        const firstIds = firstBody.recipes.map((r) => r.id);
        const secondIds = secondBody.recipes.map((r) => r.id);
        expect(firstIds).not.toEqual(secondIds);
      }
    });
    it("should return 404 for invalid cursor", async () => {
      await request(app.getHttpServer())
        .get("/recipes/latest?cursor=invalid_cursor")
        .expect(404);
    });
    it("should return recipes in descending order of update datetime", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/latest?limit=5")
        .expect(200);
      const body = response.body as LatestRecipesResponseDto;

      if (body.recipes.length > 1) {
        for (let index = 0; index < body.recipes.length - 1; index++) {
          const currentDate = new Date(body.recipes[index].createdAt);
          const nextDate = new Date(body.recipes[index + 1].createdAt);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(
            nextDate.getTime(),
          );
        }
      }
    });
  });

  describe("GET /recipes/discover", () => {
    it("should return random recipes for authenticated user", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/discover")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(200);
      const body = response.body as DiscoverRecipesResponseDto;
      expect(body).toHaveProperty("recipes");
      expect(Array.isArray(body.recipes)).toBe(true);
    });
    it("should respect limit query parameter", async () => {
      const limit = 1;
      const response = await request(app.getHttpServer())
        .get(`/recipes/discover?limit=${limit.toString()}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(200);
      const body = response.body as DiscoverRecipesResponseDto;
      expect(body.recipes.length).toBeLessThanOrEqual(limit);
    });
    it("should exclude user's own recipes", async () => {
      const newRecipe: RecipeCreateDto = {
        title: "User's Own Recipe",
        description: "This should be excluded from discovery",
        ingredients: ["Test ingredient"],
        steps: ["Test step"],
      };
      const createResponse = await request(app.getHttpServer())
        .post("/recipes")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send(newRecipe)
        .expect(201);
      const createdRecipe = createResponse.body as RecipeResponseDto;

      const discoverResponse = await request(app.getHttpServer())
        .get("/recipes/discover?limit=10")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(200);
      const discoverBody = discoverResponse.body as DiscoverRecipesResponseDto;
      const ownRecipeFound = discoverBody.recipes.some(
        (recipe) => recipe.id === createdRecipe.id,
      );
      expect(ownRecipeFound).toBe(false);
    });
    it("should handle case when there are no recipes to discover", async () => {
      const response = await request(app.getHttpServer())
        .get("/recipes/discover?limit=10")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const body = response.body as DiscoverRecipesResponseDto;
      expect(Array.isArray(body.recipes)).toBe(true);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
