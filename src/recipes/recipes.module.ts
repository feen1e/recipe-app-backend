import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";

@Module({
  providers: [RecipesService],
  controllers: [RecipesController],
  imports: [PrismaModule, AuthModule],
})
export class RecipesModule {}
