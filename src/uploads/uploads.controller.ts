import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";

import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";

@Controller("uploads")
@ApiTags("uploads")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadsController {
  @Post(":type")
  @ApiOperation({ summary: "Upload a file" })
  @ApiResponse({
    status: 201,
    description: "The file has been successfully uploaded.",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (_request, file, callback) => {
        if (file.mimetype.startsWith("image/")) {
          callback(null, true);
        } else {
          callback(new Error("Only image files allowed"), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      storage: diskStorage({
        destination: (request, _file, callback) => {
          const type = request.params.type;
          const uploadPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            type,
          );
          callback(null, uploadPath);
        },
        filename: (_request, file, callback) => {
          const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  uploadFile(
    @Param("type") type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const allowedTypes = ["avatars", "recipes"];
    if (!allowedTypes.includes(type)) {
      throw new BadRequestException("Invalid upload type");
    }
    return {
      filename: file.filename,
      url: `/uploads/${type}/${file.filename}`,
    };
  }
}
