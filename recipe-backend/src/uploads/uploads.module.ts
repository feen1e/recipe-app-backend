import { Module, forwardRef } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [forwardRef(() => AuthModule)],
  exports: [UploadsService],
})
export class UploadsModule {}
