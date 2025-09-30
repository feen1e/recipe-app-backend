import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class DiscoverRecipesQueryDto {
  @ApiPropertyOptional({
    description: "Number of random recipes to fetch",
    minimum: 1,
    maximum: 50,
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
  @Max(50)
  limit?: number = 10;
}
