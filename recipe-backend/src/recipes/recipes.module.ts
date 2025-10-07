import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";

@Module({
  providers: [RecipesService],
  controllers: [RecipesController],
  imports: [PrismaModule, AuthModule, ConfigModule],
})
export class RecipesModule {}
