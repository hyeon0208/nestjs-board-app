import { Injectable } from '@nestjs/common';
import { BoardCreateRequestDto } from './dto/boards-create-request.dto';
import { PrismaRepository } from 'prisma/prisma.repository';

import { Board } from '@prisma/client';
import { BoardsUpdateRequestDto } from './dto/boards-update-request.dto';

@Injectable()
export class BoardsService {
  constructor(private prismaRepository: PrismaRepository) {}

  async getAllBoards(): Promise<Board[]> {
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
