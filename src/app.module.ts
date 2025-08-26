import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TracingModule } from './shared/trace/tracing.module';

@Module({
  imports: [PrismaModule, BoardsModule, AuthModule, TracingModule],
})
export class AppModule {}
