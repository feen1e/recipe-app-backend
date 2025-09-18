import type { Role } from "@prisma/client";

export class UserUpdateForAdminDto {
  username?: string;
  email?: string;
  bio?: string;
  role?: Role;
  avatarUrl?: string;
}
