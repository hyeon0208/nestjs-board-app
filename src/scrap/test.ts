// import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ScrapController } from './scrap.controller';
import { logger } from 'src/logging/syncly.logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(logger); // nest 자체 로거를 교체
  const ctrl = app.get(ScrapController);

  Promise.all([ctrl.test(), ctrl.test(), ctrl.test()]);
  // Promise.all([ctrl.test()]);

  await app.close();
}
bootstrap().catch((err) => {
  logger.error(err);
});
