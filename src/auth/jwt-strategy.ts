import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaRepository } from 'prisma/prisma.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaRepository) {
    super({
      secretOrKey: 'my-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { name: payload.name },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
