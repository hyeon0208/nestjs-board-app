import { Injectable } from '@nestjs/common';
import { Board } from './board.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateBoardDto } from './create-board.dto';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];

  getAllBoards(): Board[] {
    return this.boards;
  }

  createBoard(createBoardDto: CreateBoardDto): Board {
    const board: Board = {
      id: uuidv4(),
      title: createBoardDto.title,
      description: createBoardDto.description,
      status: createBoardDto.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.boards.push(board);
    return board;
  }
}
