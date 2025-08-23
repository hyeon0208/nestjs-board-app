export enum BoardsStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export class Board {
  id: string;
  title: string;
  description: string;
  status: BoardsStatus;
  createdAt: Date;
  updatedAt: Date;
}
