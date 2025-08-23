import { Controller, Get, Post, Body } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board, BoardsStatus } from './board.model';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: '모든 게시글 조회' })
  @ApiOkResponse({ type: Board, isArray: true })
  getAllBoards(): Board[] {
    return this.boardsService.getAllBoards();
  }

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiBody({ type: CreateBoardDto })
  @ApiCreatedResponse({ type: Board })
  createBoard(@Body() createBoardDto: CreateBoardDto): Board {
    createBoardDto.status ??= BoardsStatus.PUBLIC;
    return this.boardsService.createBoard(createBoardDto);
  }
}
