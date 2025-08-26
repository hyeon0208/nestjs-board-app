// tracing.module.ts
import { Global, Module } from '@nestjs/common';
import { TracingConsoleLogger } from './tracing.console-logger';

@Global()
@Module({
  providers: [TracingConsoleLogger],
  exports: [TracingConsoleLogger],
})
export class TracingModule {}
