import { compare, hash } from "bcrypt";
import { UserMetadata } from "src/users/dto/user-metadata.dto";

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "../users/users.service";
import { LoginResponseDto } from "./dto/login-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  private readonly saltRounds = 10;

  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    const existingUser = await this.usersService.findOne(dto.email);
    if (existingUser !== null) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await hash(dto.password, this.saltRounds);

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    const token = await this.generateToken(user.id, user.email);

    return {
      token,
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findOne(dto.identifier);
    if (
      user === null ||
      !(await compare(dto.password, user.password).catch(() => false))
    ) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = await this.generateToken(user.id, user.email);

    return {
      token,
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async generateToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  async verifyToken(token: string): Promise<UserMetadata> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);
      return await this.usersService.getUserMetadata(
        payload.sub,
        payload.email,
      );
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
