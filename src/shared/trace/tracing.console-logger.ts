import { ConsoleLogger, Injectable } from '@nestjs/common';
import path from 'node:path';
import { ensureSeed, getCtx, getDepth, getExecId } from './context';

@Injectable()
export class TracingConsoleLogger extends ConsoleLogger {
  private fmt(level: string, message: unknown, ctx?: string) {
    ensureSeed();
    const id = getExecId() ?? '–';
    const d = getDepth();
    const tag = ctx ?? getCtx() ?? '';
    const prefix = `[${id}] [d=${d}]${tag ? ` [${tag}]` : ''}`;
    const loc = this.getLocation(3);
    // 기본 NestJS 색상/포맷은 부모(ConsoleLogger)가 처리 → 여기서는 prefix와 위치만 추가
    return `${prefix} ${String(message)} (${loc})`;
  }

  log(message: unknown, context?: string) {
    super.log(this.fmt('LOG', message, context), context);
  }
  error(message: unknown, stack?: string, context?: string) {
    const base = String(message);
    const msg = stack ? `${base}\n${stack}` : base;
    super.error(this.fmt('ERROR', msg, context), stack, context);
  }
  warn(message: unknown, context?: string) {
    super.warn(this.fmt('WARN', message, context), context);
  }
  debug(message: unknown, context?: string) {
    super.debug(this.fmt('DEBUG', message, context), context);
  }
  verbose(message: unknown, context?: string) {
    super.verbose(this.fmt('VERBOSE', message, context), context);
  }

  getLocation(depth = 2): string {
    const stack = new Error().stack?.split('\n') ?? [];
    const line = stack[depth] ?? '';
    const match = line.match(/\(([^)]+):(\d+):\d+\)$/);
    if (!match) return 'unknown';
    const [, fullPath, lineNum] = match;
    const rel = path.relative(process.cwd(), fullPath);
    return `${rel}:${lineNum}`;
  }
}
