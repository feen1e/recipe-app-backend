import type { Role, User } from "@prisma/client";

export class UserMetadata {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export function userToMetadata(user: User): UserMetadata {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
