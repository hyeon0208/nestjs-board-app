// tracing.module.ts
import { Global, Module } from '@nestjs/common';
import { TracingConsoleLogger } from './tracing.console-logger';
import { TracingJsonLogger } from './tracing.json-logger';
import { TracingPinoLogger } from './tracing.pino-logger';

@Global()
@Module({
  providers: [TracingConsoleLogger, TracingJsonLogger, TracingPinoLogger],
  exports: [TracingConsoleLogger, TracingJsonLogger, TracingPinoLogger],
})
export class TracingModule {}
