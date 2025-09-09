import 'source-map-support/register';
import { Injectable } from '@nestjs/common';
import pino, { Logger, LoggerOptions } from 'pino';
import { asyncContext } from './async-context';
import { LoggerService } from '@nestjs/common';
import { buildPinoLoggerFormatOptions } from './pino-log-formatter';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

@Injectable()
export class CustomLogger implements LoggerService {
  private static instance: CustomLogger;
  private readonly logger: Logger;

  static getInstance() {
    if (!CustomLogger.instance) {
      CustomLogger.instance = new CustomLogger();
    }
    return CustomLogger.instance;
  }

  constructor() {
    const opts: LoggerOptions = buildPinoLoggerFormatOptions();
    if (process.env.NODE_ENV === 'local') {
      this.logger = pino(
        opts,
        pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }) as pino.DestinationStream,
      );
    } else {
      this.logger = pino(opts);
    }

    if (
      (process.env.ENABLE_CONSOLE_HIJACK ?? 'false').toLowerCase() === 'true'
    ) {
      this.#redirectConsole();
    }
  }

  // 외부 라이브러리의 로그도 자체 로그 포맷으로 바꿔 일관된 형태로 출력하기 위한 코드인데 외부 라이브러리들의 로깅은 표준 출력 방식을 사용하지 않을까?
  #redirectConsole() {
    console.trace = (...args: any[]) => this.trace(args.join(' '));
    console.debug = (...args: any[]) => this.debug(args.join(' '));
    console.info = (...args: any[]) => this.info(args.join(' '));
    console.warn = (...args: any[]) => this.warn(args.join(' '));
    console.error = (...args: any[]) => this.error(args.join(' '));
  }

  trace(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.trace(...args);
  }

  debug(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.debug(...args);
  }

  log(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.info(...args);
  }

  info(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.info(...args);
  }

  warn(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.warn(...args);
  }

  error(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.error(...args);
  }

  fatal(...args: unknown[]) {
    // @ts-expect-error - Pino expects specific argument types
    this.logger.fatal(...args);
  }

  addContext(context: Record<string, unknown>): void {
    asyncContext.add(context);
  }

  deleteContext(...keys: string[]): void {
    keys.forEach((k) => asyncContext.delete(k));
  }

  replaceContext(context: Record<string, unknown>): void {
    asyncContext.replace(context);
  }

  resetContext(): void {
    asyncContext.reset();
  }
}

export const logger = CustomLogger.getInstance();
