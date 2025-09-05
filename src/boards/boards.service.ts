import { Injectable } from '@nestjs/common';
import { BoardCreateRequestDto } from './dto/boards-create-request.dto';
import { PrismaRepository } from 'prisma/prisma.repository';

import { Board } from '@prisma/client';
import { BoardsUpdateRequestDto } from './dto/boards-update-request.dto';
import { logger } from 'src/logging/syncly.logger';

@Injectable()
export class BoardsService {
  constructor(private prismaRepository: PrismaRepository) {}

  async fetchBoards() {
    logger.info('fetchBoards:start');
    await new Promise((resolve) => setTimeout(resolve, 120));
    logger.info('fetchBoards:done');
    return ['board1'];
  }

  async countBoards() {
    logger.info('countBoards:start');
    await new Promise((resolve) => setTimeout(resolve, 80));
    logger.info('countBoards:done');
    return 1;
  }

  async loadMeta() {
    logger.info('loadMeta:start');
    await new Promise((resolve) => setTimeout(resolve, 60));
    logger.info('loadMeta:done');
    return { v: 1 };
  }

  async getAllBoards(): Promise<Board[]> {
    logger.info('service getAllBoards');
    return this.prismaRepository.board.findMany();
  }

  async createBoard(createBoardDto: BoardCreateRequestDto): Promise<Board> {
    return this.prismaRepository.board.create({
      data: {
        title: createBoardDto.title,
        description: createBoardDto.description,
        status: createBoardDto.status,
      },
    });
  }

  async getById(id: string): Promise<Board> {
    return this.prismaRepository.board.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async updateById(id: string, updateBoardDto: BoardsUpdateRequestDto) {
    return this.prismaRepository.board.update({
      where: {
        id,
      },
      data: {
        status: updateBoardDto.status,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaRepository.board.delete({
      where: {
        id,
      },
    });
  }
}
