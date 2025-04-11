import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Please login again to continue');
    }

    if (accessToken) {
      const decoded = this.jwt.verify(accessToken, {
        secret: this.config.get<string>('ACCESS_TOKEN_COMPANY_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid access token');
      }
      await this.updateAccessToken(req);
    }
    return true;
  }

  private async updateAccessToken(req: any): Promise<void> {
    try {
      const refreshTokendata = req.headers.refreshtoken as string;

      const decoded = this.jwt.verify(refreshTokendata, {
        secret: this.config.get<string>('REFRESH_TOKEN_COMPANY_SECRET'),
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const company = await this.prisma.company.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!company) {
        throw new BadRequestException('This company not found');
      }

      const accessToken = this.jwt.sign(
        { id: company.id },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_COMPANY_SECRET'),
          expiresIn: '15m',
        },
      );

      const refreshToken = this.jwt.sign(
        { id: company.id },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_COMPANY_SECRET'),
          expiresIn: '7d',
        },
      );

      req.accesstoken = accessToken;
      req.refreshtoken = refreshToken;
      req.company = company;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
