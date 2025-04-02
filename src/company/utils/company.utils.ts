import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Company, User } from '@prisma/client';

export class TokenSenderCompany {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public sendToken(data: Company) {
    const accessToken = this.jwt.sign(
      {
        id: data.id,
      },
      {
        secret: this.config.get<string>('ACCESS_TOKEN_COMPANY_SECRET'),
        expiresIn: '1d',
      },
    );
    const refreshToken = this.jwt.sign(
      {
        id: data.id,
      },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_COMPANY_SECRET'),
        expiresIn: '7d',
      },
    );

    return { data, accessToken, refreshToken };
  }
}
