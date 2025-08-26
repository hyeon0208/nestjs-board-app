import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { BoardsController } from './boards.controller';
import { TracingConsoleLogger } from 'src/shared/trace/tracing.console-logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  // 커스텀 콘솔 로거 사용
  app.useLogger(app.get(TracingConsoleLogger));
  const ctrl = app.get(BoardsController);
  await ctrl.test();
  await app.close();
}
bootstrap().catch((err) => {
  console.error(err);
});
