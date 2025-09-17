import { RegisterDto } from "src/auth/dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";

import { Injectable, NotFoundException } from "@nestjs/common";

import { UserMetadata, userToMetadata } from "./dto/user-metadata.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: dto.password,
      },
    });
  }

  async findOne(identifier: string) {
    const isEmail = identifier.includes("@");
    return this.prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
    });
  }

  async getUserMetadata(sub: string, email: string): Promise<UserMetadata> {
    const user = await this.prisma.user.findUnique({
      where: { id: sub, email },
    });

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return userToMetadata(user);
  }
}
