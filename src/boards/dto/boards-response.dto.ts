import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class BoardResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: $Enums.BoardsStatus, enumName: 'BoardsStatus' })
  status: $Enums.BoardsStatus;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
