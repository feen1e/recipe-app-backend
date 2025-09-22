import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthModule } from "../src/auth/auth.module";
import type { LoginResponseDto } from "../src/auth/dto/login-response.dto";
import { CollectionsModule } from "../src/collections/collections.module";
import type { CollectionCreateDto } from "../src/collections/dto/collection-create.dto";
import type { CollectionResponseDto } from "../src/collections/dto/collection-response.dto";
import type { CollectionUpdateDto } from "../src/collections/dto/collection-update.dto";
import { PrismaModule } from "../src/prisma/prisma.module";
import { RecipesModule } from "../src/recipes/recipes.module";
import { seedDatabase } from "./seed-database";

describe("CollectionsController (e2e)", () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let _adminEmail: string;
  let userToken: string;
  let _userEmail: string;
  let anotherUserToken: string;
  let _anotherUserEmail: string;
  let collectionId: string;
  let collectionName: string;
  let collectionDescription: string | null;

  beforeEach(async () => {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AuthModule,
        ConfigModule,
        RecipesModule,
        CollectionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
      }),
    );

    await app.init();

    const adminLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "admin@example.com", password: "admin123" });

    adminToken = adminLoginResponse.body.token;
    _adminEmail = adminLoginResponse.body.email;

    const userLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "user@example.com", password: "user123" });

    userToken = userLoginResponse.body.token;
    _userEmail = userLoginResponse.body.email;

    const anotherUserLoginResponse: { body: LoginResponseDto } = await request(
      app.getHttpServer(),
    )
      .post("/auth/login")
      .send({ identifier: "another@example.com", password: "user123" });

    anotherUserToken = anotherUserLoginResponse.body.token;
    _anotherUserEmail = anotherUserLoginResponse.body.email;
  });

  describe("GET /collections", () => {
    it("should return all collections", async () => {
      const response = await request(app.getHttpServer())
        .get("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /collections/user/:username", () => {
    it("should return collections of a specific user", async () => {
      const response = await request(app.getHttpServer())
        .get(`/collections/user/${_userEmail}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
    it("should return 404 for non-existing user", async () => {
      await request(app.getHttpServer())
        .get("/collections/user/non_existing_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("GET /collections/:id", () => {
    beforeEach(async () => {
      const newCollection: CollectionCreateDto = {
        name: "Test Collection",
        description: "A collection for testing",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newCollection)
        .expect(201);

      const body = response.body as CollectionResponseDto;

      collectionId = body.id;
      collectionName = body.name;
      collectionDescription = body.description;
    });
    it("should return collection details", async () => {
      const response = await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      const collection = response.body as CollectionResponseDto;
      expect(collection).toHaveProperty("id", collectionId);
      expect(collection).toHaveProperty("name", collectionName);
      expect(collection).toHaveProperty("description", collectionDescription);
      expect(collection).toHaveProperty("recipes");
    });
    it("should return 404 for non-existing collection", async () => {
      const nonExistingId = "non-existing-id";
      await request(app.getHttpServer())
        .get(`/collections/${nonExistingId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("POST /collections", () => {
    it("should create a new collection with valid data", async () => {
      const newCollection: CollectionCreateDto = {
        name: "My Favorite Recipes",
        description: "Collection of my favorite recipes",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newCollection)
        .expect(201);

      const collection = response.body as CollectionResponseDto;
      expect(collection).toHaveProperty("id");
      expect(collection.name).toBe(newCollection.name);
      expect(collection.description).toBe(newCollection.description);
    });
    it("should create collection without description", async () => {
      const newCollection: CollectionCreateDto = {
        name: "Simple Collection",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newCollection)
        .expect(201);

      const collection = response.body as CollectionResponseDto;
      expect(collection.name).toBe(newCollection.name);
      expect(collection.description).toBeNull();
    });
    it("should return 400 for missing required fields", async () => {
      const incompleteCollection = {
        description: "Collection without name",
      };

      await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(incompleteCollection)
        .expect(400);
    });
    it("should return 400 for empty name", async () => {
      const invalidCollection: CollectionCreateDto = {
        name: "",
        description: "Collection with empty name",
      };

      await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(invalidCollection)
        .expect(400);
    });
  });

  describe("PATCH /collections/:id", () => {
    beforeEach(async () => {
      const newCollection: CollectionCreateDto = {
        name: "Original Collection",
        description: "Original description",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newCollection)
        .expect(201);

      const body = response.body as CollectionResponseDto;
      collectionId = body.id;
      collectionName = body.name;
      collectionDescription = body.description;
    });
    it("should update collection name and description", async () => {
      const updateData: CollectionUpdateDto = {
        name: "Updated Collection Name",
        description: "Updated description",
      };

      const response = await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      const collection = response.body as CollectionResponseDto;
      expect(collection.name).toBe(updateData.name);
      expect(collection.description).toBe(updateData.description);
    });
    it("should update only name when description not provided", async () => {
      const updateData: CollectionUpdateDto = {
        name: "New Name Only",
      };

      const response = await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      const collection = response.body as CollectionResponseDto;
      expect(collection.name).toBe(updateData.name);
      expect(collection.description).toBe(collectionDescription);
    });
    it("should return 403 for non-owner trying to update", async () => {
      const updateData: CollectionUpdateDto = {
        name: "Someone's Collection",
      };

      await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send(updateData)
        .expect(403);
    });
    it("should return 404 for non-existing collection", async () => {
      const updateData: CollectionUpdateDto = {
        name: "Updated Name",
      };

      await request(app.getHttpServer())
        .patch("/collections/non-existing-id")
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe("DELETE /collections/:id", () => {
    beforeEach(async () => {
      const newCollection: CollectionCreateDto = {
        name: "Collection to Delete",
        description: "This will be deleted",
      };

      const response = await request(app.getHttpServer())
        .post("/collections")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newCollection)
        .expect(201);

      const body = response.body as CollectionResponseDto;
      collectionId = body.id;
    });

    it("should delete collection for owner", async () => {
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      // Verify collection is deleted
      await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
    it("should return 403 for non-owner trying to delete", async () => {
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(403);
    });
    it("should return 404 for non-existing collection", async () => {
      await request(app.getHttpServer())
        .delete("/collections/non-existing-id")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
    it("should allow admin to delete any collection", async () => {
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
