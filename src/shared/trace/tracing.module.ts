// tracing.module.ts
import { Global, Module } from '@nestjs/common';
import { TracingLogger } from './tracing-logger.service';

@Global()
@Module({
  providers: [TracingLogger],
  exports: [TracingLogger],
})
export class TracingModule {}
