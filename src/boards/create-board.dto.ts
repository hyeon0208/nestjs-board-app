import { ApiProperty } from '@nestjs/swagger';
import { BoardsStatus } from './board.model';

export class CreateBoardDto {
  @ApiProperty({ example: '제목입니다' })
  title: string;

  @ApiProperty({ example: '설명입니다' })
  description: string;

  @ApiProperty({
    example: 'PUBLIC',
    enum: BoardsStatus,
    enumName: 'BoardsStatus',
  })
  status: BoardsStatus;
}
