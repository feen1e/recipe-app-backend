import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
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
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { FileUploadResponseDto } from "./dto/file-upload-response.dto";
import { FileUploadDto } from "./dto/file-upload.dto";

@Controller("uploads")
@ApiTags("uploads")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadsController {
  static readonly ALLOWED_TYPES = ["avatars", "recipes"];

  @Post(":type")
  @ApiOperation({ summary: "Upload a file" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({
    name: "type",
    description:
      'The type (subdirectory) of upload, either "avatars" or "recipes"',
    example: "avatars",
  })
  @ApiBody({
    description: "File upload",
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 201,
    description: "The file has been successfully uploaded.",
    type: FileUploadResponseDto,
  })
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (_request, file, callback) => {
        if (file.mimetype.startsWith("image/")) {
          callback(null, true);
        } else {
          callback(new BadRequestException("Only image files allowed"), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      storage: diskStorage({
        destination: (request, _file, callback) => {
          const type = request.params.type;
          if (!UploadsController.ALLOWED_TYPES.includes(type)) {
            callback(
              new BadRequestException(
                `Invalid upload type: ${type}. Allowed types: ${UploadsController.ALLOWED_TYPES.join(", ")}`,
              ),
              "",
            );
            return;
          }

          const uploadPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            type,
          );
          mkdirSync(uploadPath, { recursive: true });
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
    return {
      filename: file.filename,
      url: `${type}/${file.filename}`,
    };
  }
}
