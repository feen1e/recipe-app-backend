import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RatingsController } from "./ratings.controller";
import { RatingsService } from "./ratings.service";

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [PrismaModule, AuthModule, ConfigModule],
})
export class RatingsModule {}
