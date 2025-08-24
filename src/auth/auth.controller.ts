import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { ApiOperation } from '@nestjs/swagger';
import { SignUpResponseDto } from './dto/signup-response.dto';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';
import { UserInfo } from './user-info.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiCreatedResponse({ type: SignUpResponseDto })
  async signUp(
    @Body() signUpRequestDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    return this.authService.signUp(signUpRequestDto);
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiOkResponse()
  async login(@Body() signUpRequestDto: SignUpRequestDto): Promise<string> {
    return this.authService.login(signUpRequestDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @UserInfo() user: User,
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    console.log(user);
    return this.authService.update(id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}
