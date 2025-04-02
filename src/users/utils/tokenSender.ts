import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Company, User } from '@prisma/client';

export class TokenSender {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public sendToken(data: User) {
    const accessToken = this.jwt.sign(
      {
        id: data.id,
      },
      {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1d',
      },
    );
    const refreshToken = this.jwt.sign(
      {
        id: data.id,
      },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    return { data, accessToken, refreshToken };
  }
}
