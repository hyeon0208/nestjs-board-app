import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ensureSeed, getCtx, getDepth, getExecId } from './context';

@Injectable()
export class TracingConsoleLogger extends ConsoleLogger {
  private fmt(level: string, message: any, ctx?: string) {
    ensureSeed();
    const id = getExecId() ?? '–';
    const d = getDepth();
    const tag = ctx ?? getCtx() ?? '';
    const prefix = `[${id}] [d=${d}]${tag ? ` [${tag}]` : ''}`;

    // 기본 NestJS 색상/포맷은 부모(ConsoleLogger)가 처리 → 여기서는 prefix만 추가
    return `${prefix} ${message}`;
  }

  log(message: any, context?: string) {
    super.log(this.fmt('LOG', message, context), context);
  }
  error(message: any, stack?: string, context?: string) {
    const msg = stack ? `${message}\n${stack}` : message;
    super.error(this.fmt('ERROR', msg, context), stack, context);
  }
  warn(message: any, context?: string) {
    super.warn(this.fmt('WARN', message, context), context);
  }
  debug(message: any, context?: string) {
    super.debug(this.fmt('DEBUG', message, context), context);
  }
  verbose(message: any, context?: string) {
    super.verbose(this.fmt('VERBOSE', message, context), context);
  }

  getLocation(d: number): string {
    const stack = new Error().stack?.split('\n') ?? [];
    console.log(stack);
    const line = stack?.[d] ?? ''; // depth=2면 호출 지점 기준
    const match = line.match(/\(([^)]+):(\d+):\d+\)$/);

    if (!match) return 'unknown';

    const [, fullPath, lineNum] = match;
    const file = fullPath.split('/').pop() ?? fullPath;
    return `${file}:${lineNum}`;
  }
}
