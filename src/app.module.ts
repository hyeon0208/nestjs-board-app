import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, BoardsModule, AuthModule],
})
export class AppModule {}
