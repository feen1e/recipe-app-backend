import { promises as fs } from "node:fs";
import path from "node:path";

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  async deleteFile(urlPath: string): Promise<void> {
    try {
      const relativePath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
      const absolutePath = path.join(process.cwd(), "public", relativePath);

      if (!this.isPathSafe(absolutePath)) {
        this.logger.warn(`Unsafe file path attempted: ${absolutePath}`);
        return;
      }

      try {
        await fs.access(absolutePath);
      } catch {
        this.logger.warn(`File not found, skipping deletion: ${absolutePath}`);
        return;
      }

      await fs.unlink(absolutePath);
      this.logger.log(`Successfully deleted file: ${absolutePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${urlPath}:`, error);
    }
  }

  // Ensures the file is in the uploads directory
  private isPathSafe(absolutePath: string): boolean {
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
    const normalizedPath = path.normalize(absolutePath);
    const normalizedUploadsDirectory = path.normalize(uploadsDirectory);
    return normalizedPath.startsWith(normalizedUploadsDirectory);
  }
}
