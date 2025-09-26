import type { Role, User } from "@prisma/client";

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export function userToResponseDto(user: User, appUrl: string): UserResponseDto {
  const filename = user.avatarUrl?.trim();
  const avatar =
    filename?.length === 0 || filename === undefined
      ? undefined
      : `${appUrl}/uploads/${filename}`;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio ?? undefined,
    avatarUrl: avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
