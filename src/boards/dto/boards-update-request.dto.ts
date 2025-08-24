import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class BoardsUpdateRequestDto {
  @ApiProperty({
    example: 'PUBLIC',
    enum: $Enums.BoardsStatus,
    enumName: 'BoardsStatus',
  })
  @IsEnum($Enums.BoardsStatus)
  status: $Enums.BoardsStatus;
}
