import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthModule } from "../src//auth/auth.module";
import type { LoginResponseDto } from "../src//auth/dto/login-response.dto";
import { FavoritesModule } from "../src/favorites/favorites.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import type { RecipeResponseDto } from "../src/recipes/dto/recipe-response.dto";
import { RecipesModule } from "../src/recipes/recipes.module";
import { seedDatabase } from "./seed-database";

describe("FavoritesController (e2e)", () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let _userId: string;
  let recipeId: string;

  beforeEach(async () => {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AuthModule,
        RecipesModule,
        ConfigModule,
        FavoritesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
      }),
    );

    const adminLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "admin@example.com", password: "admin123" });

    adminToken = adminLoginResponse.body.token;
    adminId = adminLoginResponse.body.id;

    const userLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "user@example.com", password: "user123" });

    userToken = userLoginResponse.body.token;
    _userId = userLoginResponse.body.id;

    const recipesResponse = await request(app.getHttpServer())
      .get("/recipes/user/normal_user")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    const recipes: RecipeResponseDto[] =
      recipesResponse.body as RecipeResponseDto[];
    recipeId = recipes.length > 0 ? recipes[0].id : "";
  });

  describe("GET /favorites/:username", () => {
    it("should return 200 and an empty array for a user with no favorites", async () => {
      const response = await request(app.getHttpServer())
        .get("/favorites/admin_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      expect(response.body).toEqual([]);
    });
    it("should return 200 and an array of favorite recipes for a user with favorites", async () => {
      // normal_user has a favorite recipe from the seed
      const reponse = await request(app.getHttpServer())
        .get(`/favorites/normal_user`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      expect(Array.isArray(reponse.body)).toBe(true);
      expect(
        (reponse.body as RecipeResponseDto[]).length,
      ).toBeGreaterThanOrEqual(1);
    });
    it("should return 404 for a non-existent user", async () => {
      const _response = await request(app.getHttpServer())
        .get("/favorites/non_existent_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("POST /favorites/:recipeId", () => {
    it("should return 201 when adding a recipe to favorites if it's not already a favorite", async () => {
      const response = await request(app.getHttpServer())
        .post(`/favorites/${recipeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);
      expect(response.body).toMatchObject({
        userId: adminId,
        recipeId,
      });
    });
    it("should return 409 when adding a recipe to favorites if it's already a favorite", async () => {
      const _response = await request(app.getHttpServer())
        .post(`/favorites/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(409);
    });
    it("should return 404 when adding a non-existent recipe to favorites", async () => {
      const _response = await request(app.getHttpServer())
        .post(`/favorites/non-existent-recipe-id`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("DELETE /favorites/:recipeId", () => {
    it("should return 200 when removing a recipe from favorites", async () => {
      const _response = await request(app.getHttpServer())
        .delete(`/favorites/${recipeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
    });
    it("should return 404 when removing a recipe that's not in favorites", async () => {
      const _response = await request(app.getHttpServer())
        .delete(`/favorites/${recipeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
