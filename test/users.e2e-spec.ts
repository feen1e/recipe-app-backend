import type { RegisterDto } from "src/auth/dto/register.dto";
import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthModule } from "../src//auth/auth.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { seedDatabase } from "./seed-database";
import { TestDataFactory } from "./test-data-factory";

describe("UsersController (e2e)", () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let _adminEmail: string;
  let _adminId: string;
  let userToken: string;
  let userEmail: string;
  let userId: string;

  beforeEach(async () => {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, ConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
      }),
    );

    const tokens = await TestDataFactory.getAuthTokens(app);
    adminToken = tokens.adminToken;
    _adminEmail = tokens.adminEmail;
    _adminId = tokens.adminId;
    userToken = tokens.userToken;
    userEmail = tokens.userEmail;
    userId = tokens.userId;
  });

  describe("GET /users/:username", () => {
    it("should return user profile for valid username", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/normal_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", "normal_user");
    });
    it("should return 404 for non-existing username", async () => {
      await request(app.getHttpServer())
        .get("/users/non_existing_user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("GET /users/id/:id", () => {
    it("should return user profile for valid ID", async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/id/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("username", "normal_user");
      expect(response.body).toHaveProperty("avatarUrl");
    });
    it("should return 404 for non-existing ID", async () => {
      await request(app.getHttpServer())
        .get("/users/id/non-existing-id")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("POST /users", () => {
    it("should create a new user with valid data", async () => {
      const newUser: RegisterDto = {
        username: "new_user",
        email: "new_user@example.com",
        password: "user123",
      };

      const response: { body: RegisterDto } = await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", newUser.username);
    });
    it("should return 400 for missing required fields", async () => {
      const incompleteUser = {
        username: "incomplete_user",
      };
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(incompleteUser)
        .expect(400);
    });
    it("should return 403 when a non-admin tries to create a user", async () => {
      const newUser: RegisterDto = {
        username: "another_user",
        email: "another_user@example.com",
        password: "user123",
      };
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newUser)
        .expect(403);
    });
  });

  describe("PATCH /users", () => {
    it("should update user data for authenticated user", async () => {
      const updates = {
        bio: "Updated bio",
      };
      const response = await request(app.getHttpServer())
        .patch(`/users`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty("bio", updates.bio);
    });
    it("should return 403 when the new username is already taken", async () => {
      const updates = {
        username: "admin_user",
      };
      await request(app.getHttpServer())
        .patch(`/users`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updates)
        .expect(403);
    });
  });

  describe("PATCH /users/:email", () => {
    it("should update user data by admin", async () => {
      const updates = {
        bio: "Admin updated bio",
      };
      const response = await request(app.getHttpServer())
        .patch(`/users/${userEmail}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty("bio", updates.bio);
    });
    it("should return 403 when the new username is already taken by another user", async () => {
      const updates = {
        username: "admin_user",
      };
      await request(app.getHttpServer())
        .patch(`/users/${userEmail}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates)
        .expect(403);
    });
    it("should return 403 when the new email is already taken by another user", async () => {
      const updates = {
        email: "admin@example.com",
      };
      await request(app.getHttpServer())
        .patch(`/users/${userEmail}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates)
        .expect(403);
    });
    it("should return 404 when trying to update a non-existing user", async () => {
      const updates = {
        bio: "Should not work",
      };
      await request(app.getHttpServer())
        .patch(`/users/non-existing-email@example.com`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
