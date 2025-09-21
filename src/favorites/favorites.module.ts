import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FavoritesController } from "./favorites.controller";
import { FavoritesService } from "./favorites.service";

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [PrismaModule, AuthModule, ConfigModule],
})
export class FavoritesModule {}
