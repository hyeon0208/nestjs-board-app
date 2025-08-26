import type {
  INestApplication,
  INestApplicationContext,
  LoggerService,
} from '@nestjs/common';
import { TracingConsoleLogger } from './tracing.console-logger.js';
import { TracingJsonLogger } from './tracing.json-logger.js';
import { TracingPinoLogger } from './tracing.pino-logger.js';

type Container =
  | Pick<INestApplication, 'get'>
  | Pick<INestApplicationContext, 'get'>;

export function selectLogger(app: Container): LoggerService {
  const mode =
    process.env.LOG_MODE ??
    (process.env.NODE_ENV === 'development' ? 'console' : 'json');
  if (mode === 'console') return app.get(TracingConsoleLogger);
  if (mode === 'pino') return app.get(TracingPinoLogger);
  if (mode === 'both') {
    // 콘솔 + JSON 동시 출력
    const consoleLogger = app.get(TracingConsoleLogger);
    const jsonLogger = app.get(TracingJsonLogger);
    // 멀티 캐스트 Logger
    return {
      log: (m, c) => {
        consoleLogger.log(m, c);
        jsonLogger.log(m, c);
      },
      warn: (m, c) => {
        consoleLogger.warn(m, c);
        jsonLogger.warn(m, c);
      },
      debug: (m, c) => {
        consoleLogger.debug(m, c);
        jsonLogger.debug(m, c);
      },
      verbose: (m, c) => {
        consoleLogger.verbose(m, c);
        jsonLogger.verbose(m, c);
      },
      error: (m, s, c) => {
        consoleLogger.error(m, s, c);
        jsonLogger.error(m, s, c);
      },
    } as LoggerService;
  }
  return app.get(TracingJsonLogger);
}
