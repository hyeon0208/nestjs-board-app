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
import { BoardsService } from './boards.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BoardCreateRequestDto } from './dto/boards-create-request.dto';
import { BoardsStatus } from '@prisma/client';
import { BoardResponseDto } from './dto/boards-response.dto';
import { BoardsUpdateRequestDto } from './dto/boards-update-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { error } from 'console';
import { logger } from 'src/logging/syncly.logger';

@ApiTags('boards')
// @ApiBearerAuth()
// @UseGuards(AuthGuard())
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('test')
  @ApiOperation({ summary: '병렬 로깅 테스트' })
  @ApiOkResponse()
  async test() {
    logger.info('controller:in', { workflow: 'dfa' });

    try {
      throw new Error('test error');
    } catch (error) {
      logger.error('controller:in', error);
    }

    await Promise.all([
      this.boardsService.fetchBoards(),
      this.boardsService.countBoards(),
      this.boardsService.loadMeta(),
    ]);
    logger.info('controller:out');
  }

  @Get()
  @ApiOperation({ summary: '모든 게시글 조회' })
  @ApiOkResponse({ type: BoardResponseDto, isArray: true })
  async getAllBoards(): Promise<BoardResponseDto[]> {
    return await this.boardsService.getAllBoards();
  }

  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiBody({ type: BoardCreateRequestDto })
  @ApiCreatedResponse({ type: BoardResponseDto })
  async createBoard(
    @Body() createBoardDto: BoardCreateRequestDto,
  ): Promise<BoardResponseDto> {
    createBoardDto.status =
      createBoardDto.status ?? (BoardsStatus.PUBLIC as BoardsStatus);
    return await this.boardsService.createBoard(createBoardDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 조회' })
  @ApiOkResponse({ type: BoardResponseDto })
  async getBoard(@Param('id') id: string): Promise<BoardResponseDto> {
    return await this.boardsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiBody({ type: BoardsUpdateRequestDto })
  @ApiOkResponse({ type: BoardResponseDto })
  async updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: BoardsUpdateRequestDto,
  ): Promise<BoardResponseDto> {
    return await this.boardsService.updateById(id, updateBoardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiOkResponse({ type: BoardResponseDto })
  async deleteBoard(@Param('id') id: string): Promise<void> {
    return await this.boardsService.deleteById(id);
  }
}
