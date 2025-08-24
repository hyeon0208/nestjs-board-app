import { PartialType } from '@nestjs/swagger';
import { SignUpRequestDto } from './signup-request.dto';

export class UpdateAuthDto extends PartialType(SignUpRequestDto) {}
