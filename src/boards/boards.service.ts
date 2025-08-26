import { Injectable } from '@nestjs/common';
import { BoardCreateRequestDto } from './dto/boards-create-request.dto';
import { PrismaRepository } from 'prisma/prisma.repository';

import { Board } from '@prisma/client';
import { BoardsUpdateRequestDto } from './dto/boards-update-request.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(private prismaRepository: PrismaRepository) {}

  async fetchBoards() {
    this.logger.log('fetchBoards:start');
    await new Promise((resolve) => setTimeout(resolve, 120));
    this.logger.log('fetchBoards:done');
    return ['board1'];
  }

  async countBoards() {
    this.logger.log('countBoards:start');
    await new Promise((resolve) => setTimeout(resolve, 80));
    this.logger.log('countBoards:done');
    return 1;
  }

  async loadMeta() {
    this.logger.log('loadMeta:start');
    await new Promise((resolve) => setTimeout(resolve, 60));
    this.logger.log('loadMeta:done');
    return { v: 1 };
  }

  async getAllBoards(): Promise<Board[]> {
    this.logger.log('service getAllBoards');
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
