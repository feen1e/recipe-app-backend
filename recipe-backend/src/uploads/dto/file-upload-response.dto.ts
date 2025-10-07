import { ApiProperty } from "@nestjs/swagger";

export class FileUploadResponseDto {
  @ApiProperty({
    description: "The uploaded file name",
    example: "6e9adfaf-c8ae-4e44-af90-bcf3c67d7e03.jpg",
  })
  filename: string;

  @ApiProperty({
    description: "The URL to access the uploaded file",
    example: "avatars/6e9adfaf-c8ae-4e44-af90-bcf3c67d7e03.jpg",
  })
  url: string;
}
