import { ApiProperty } from '@nestjs/swagger';
import { $Enums, BoardsStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class BoardCreateRequestDto {
  @ApiProperty({ example: '제목입니다' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '설명입니다' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'PUBLIC',
    enum: $Enums.BoardsStatus,
    enumName: 'BoardsStatus',
  })
  @IsEnum($Enums.BoardsStatus)
  status: BoardsStatus;
}
