import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class LatestRecipesQueryDto {
  @ApiPropertyOptional({
    description: "Cursor for pagination (recipe ID)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: "Number of records to fetch",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return Number.parseInt(value, 10);
    }
    return typeof value === "number" ? value : 10;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
