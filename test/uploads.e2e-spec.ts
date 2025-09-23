import request from "supertest";

import { ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthModule } from "../src/auth/auth.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import type { FileUploadResponseDto } from "../src/uploads/dto/file-upload-response.dto";
import { UploadsModule } from "../src/uploads/uploads.module";
import { seedDatabase } from "./seed-database";
import { TestDataFactory } from "./test-data-factory";

describe("UploadsController (e2e)", () => {
  let app: NestExpressApplication;
  let userToken: string;
  let _userEmail: string;

  beforeEach(async () => {
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, ConfigModule, UploadsModule],
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
    userToken = tokens.userToken;
    _userEmail = tokens.userEmail;
  });

  describe("POST /uploads/:type", () => {
    it("should upload an image file", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/uploads/avatars")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("test file content"), "test-image.png")
        .expect(201);

      expect(response.body).toHaveProperty("url");
      expect((response.body as FileUploadResponseDto).url).toMatch(
        /avatars\/.*\.png$/,
      );
    });
    it("should reject non-image file uploads", async () => {
      await request(app.getHttpServer())
        .post("/uploads/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("test file content"), "test-document.txt")
        .expect(400);
    });
    it("should upload recipe images", async () => {
      const response = await request(app.getHttpServer())
        .post("/uploads/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("file", Buffer.from("test file content"), "recipe-image.jpg")
        .expect(201);

      expect(response.body).toHaveProperty("url");
      expect((response.body as FileUploadResponseDto).url).toMatch(
        /recipes\/.*\.jpg$/,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
