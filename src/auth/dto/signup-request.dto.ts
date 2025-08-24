import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { IsString } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({ example: 'hyeonjun' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts alphanumeric characters',
  })
  password: string;
}
