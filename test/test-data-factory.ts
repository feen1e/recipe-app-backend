import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthModule } from "../src/auth/auth.module";
import type { LoginResponseDto } from "../src/auth/dto/login-response.dto";
import { PrismaModule } from "../src/prisma/prisma.module";
import type { RecipeResponseDto } from "../src/recipes/dto/recipe-response.dto";
import { seedDatabase } from "./seed-database";

export interface TestTokens {
  adminToken: string;
  adminEmail: string;
  adminId: string;
  userToken: string;
  userEmail: string;
  userId: string;
  anotherUserToken: string;
  anotherUserEmail: string;
}

export interface TestRecipeData {
  recipeId: string;
  recipes: RecipeResponseDto[];
}

export const TestDataFactory = {
  async createTestApp(): Promise<NestExpressApplication> {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, ConfigModule],
    }).compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>();
    await app.init();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
      }),
    );

    return app;
  },

  async getAuthTokens(app: NestExpressApplication): Promise<TestTokens> {
    const adminLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "admin@example.com", password: "admin123" });

    const userLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "user@example.com", password: "user123" });

    const anotherUserLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "another@example.com", password: "user123" });

    return {
      adminToken: adminLoginResponse.body.token,
      adminEmail: adminLoginResponse.body.email,
      adminId: adminLoginResponse.body.id,
      userToken: userLoginResponse.body.token,
      userEmail: userLoginResponse.body.email,
      userId: userLoginResponse.body.id,
      anotherUserToken: anotherUserLoginResponse.body.token,
      anotherUserEmail: anotherUserLoginResponse.body.email,
    };
  },

  async loginUser(
    app: NestExpressApplication,
    identifier: string,
    password: string,
  ): Promise<LoginResponseDto> {
    const response: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier, password });

    return response.body;
  },

  async getRecipesByUser(
    app: NestExpressApplication,
    username: string,
    token: string,
  ): Promise<TestRecipeData> {
    const recipesResponse = await request(app.getHttpServer())
      .get(`/recipes/user/${username}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const recipes: RecipeResponseDto[] =
      recipesResponse.body as RecipeResponseDto[];
    const recipeId = recipes.length > 0 ? recipes[0].id : "";

    return {
      recipeId,
      recipes,
    };
  },

  async getFirstRecipeId(
    app: NestExpressApplication,
    token: string,
  ): Promise<string> {
    const recipeData: TestRecipeData = await TestDataFactory.getRecipesByUser(
      app,
      "normal_user",
      token,
    );
    return recipeData.recipeId;
  },
};
