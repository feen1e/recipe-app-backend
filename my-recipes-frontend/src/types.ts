export interface LoginResponseDto {
  token: string;
  id: string;
  username: string;
  email: string;
}

export interface LoginDto {
  identifier: string; // username or email
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface RecipeResponseDto {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;

  isFavorite?: boolean;
}

export interface CollectionResponseDto {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  filename: string;
  url: string;
}
