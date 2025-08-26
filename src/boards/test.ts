import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { BoardsController } from './boards.controller';
import { selectLogger } from 'src/shared/trace/logger.select';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  // 환경에 따라 console/json/pino 로거 선택
  app.useLogger(selectLogger(app));
  const ctrl = app.get(BoardsController);
  await ctrl.test();
  await app.close();
}
bootstrap();
