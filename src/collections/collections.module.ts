import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { CollectionsController } from "./collections.controller";
import { CollectionsService } from "./collections.service";

@Module({
  providers: [CollectionsService],
  controllers: [CollectionsController],
  imports: [PrismaModule, AuthModule, UsersModule, ConfigModule],
})
export class CollectionsModule {}
