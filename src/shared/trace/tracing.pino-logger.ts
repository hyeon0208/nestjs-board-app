import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { ensureSeed, getCtx, getDepth, getExecId } from './context';

@Injectable()
export class TracingPinoLogger implements LoggerService {
  private logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
  private base() {
    ensureSeed();
    return { execId: getExecId(), depth: getDepth(), ctx: getCtx() };
  }
  log(m: any, c?: string) {
    this.logger.info({ ...this.base(), ctx: c ?? this.base().ctx }, m);
  }
  warn(m: any, c?: string) {
    this.logger.warn({ ...this.base(), ctx: c ?? this.base().ctx }, m);
  }
  debug(m: any, c?: string) {
    this.logger.debug({ ...this.base(), ctx: c ?? this.base().ctx }, m);
  }
  verbose(m: any, c?: string) {
    this.logger.trace({ ...this.base(), ctx: c ?? this.base().ctx }, m);
  }
  error(m: any, s?: string, c?: string) {
    this.logger.error(
      { ...this.base(), ctx: c ?? this.base().ctx, stack: s },
      m,
    );
  }
}
