import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaRepository } from 'prisma/prisma.repository';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpRequestDto: SignUpRequestDto): Promise<User> {
    if (await this.existsByName(signUpRequestDto.name)) {
      throw new ConflictException('name already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpRequestDto.password, salt);

    return this.prisma.user.create({
      data: {
        name: signUpRequestDto.name,
        password: hashedPassword,
      },
    });
  }

  async login(signUpRequestDto: SignUpRequestDto): Promise<string> {
    const user = await this.findByName(signUpRequestDto.name);
    if (
      user &&
      (await bcrypt.compare(signUpRequestDto.password, user.password))
    ) {
      const payload = { sub: user.id, name: user.name };
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    }
    throw new BadRequestException('password not match');
  }

  findAll() {
    return `This action returns all auth`;
  }

  async existsByName(name: string): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({
      where: { name },
      select: { id: true },
    }));
  }

  async findByName(name: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        name,
      },
    });
  }

  update(id: string, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }
}
