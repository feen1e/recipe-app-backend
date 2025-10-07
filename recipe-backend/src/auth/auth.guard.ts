import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RequestWithUser } from "./dto/request-with-user.dto";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (token === undefined) {
      throw new UnauthorizedException("Missing token");
    }

    try {
      const user = await this.authService.verifyToken(token);
      request.user = user;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
    return true;
  }

  private extractTokenFromHeader(request: RequestWithUser): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
