// tracing.json-logger.ts — ELK용 JSON 라인
import { Injectable, LoggerService } from '@nestjs/common';
import { ensureSeed, getCtx, getDepth, getExecId } from './context';
const ts = () => new Date().toISOString();

@Injectable()
export class TracingJsonLogger implements LoggerService {
  private line(level: string, msg: any, stack?: string, ctx?: string) {
    ensureSeed();
    const obj = {
      ts: ts(),
      level,
      execId: getExecId(),
      depth: getDepth(),
      ctx: ctx ?? getCtx(),
      msg:
        typeof msg === 'string'
          ? msg
          : (() => {
              try {
                return JSON.stringify(msg);
              } catch {
                return String(msg);
              }
            })(),
      stack,
    };
    return JSON.stringify(obj) + '\n';
  }
  log(m: any, c?: string) {
    process.stdout.write(this.line('info', m, undefined, c));
  }
  warn(m: any, c?: string) {
    process.stdout.write(this.line('warn', m, undefined, c));
  }
  debug(m: any, c?: string) {
    process.stdout.write(this.line('debug', m, undefined, c));
  }
  verbose(m: any, c?: string) {
    process.stdout.write(this.line('verbose', m, undefined, c));
  }
  error(m: any, s?: string, c?: string) {
    process.stdout.write(this.line('error', m, s, c));
  }
}
