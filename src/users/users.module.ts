import { Module, forwardRef } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UploadsModule } from "../uploads/uploads.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, UploadsModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
