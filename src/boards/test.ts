import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { TracingLogger } from 'src/shared/trace/tracing-logger.service';
import { BoardsController } from './boards.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(TracingLogger));
  const ctrl = app.get(BoardsController);
  await ctrl.test();
  await app.close();
}
bootstrap();
