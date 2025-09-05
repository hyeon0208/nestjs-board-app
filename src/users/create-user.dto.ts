import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileDto {
  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: '2024-05-20',
    description: '날짜 문자열 (ISO8601 또는 YYYY-MM-DD)',
  })
  @IsDate()
  @Type(() => Date) // ✅ 문자열 → Date 변환
  createdAt: Date;

  @ApiProperty({ type: () => ProfileDto })
  @ValidateNested()
  @Type(() => ProfileDto) // <-- nested 객체 파싱 필수
  profile: ProfileDto;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
