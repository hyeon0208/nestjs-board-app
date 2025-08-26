import { Injectable, LoggerService } from '@nestjs/common';
import util from 'node:util';
import { ensureSeed, getExecId, getMeta } from './context';

// ANSI 색상 코드
const colors: Record<string, string> = {
  INFO: '\x1B[32m',
  WARN: '\x1B[33m',
  ERROR: '\x1B[31m',
  DEBUG: '\x1B[35m',
  VERBOSE: '\x1B[36m',
};
const reset = '\x1B[0m';

@Injectable()
export class TracingConsoleLogger implements LoggerService {
  private color(level: string) {
    const c = colors[level] ?? '';
    return `${c}[${level}]${reset}`;
  }

  private getLocation(): string {
    const stack = new Error().stack?.split('\n').slice(2) ?? [];
    for (const line of stack) {
      const fnMatch = line.match(/at (.+?) \(([^)]+):(\d+):\d+\)/);
      const fileMatch = line.match(/at ([^ ]+):(\d+):\d+/);
      if (!fnMatch && !fileMatch) continue;

      let method: string | undefined;
      let fullPath: string;
      let lineNum: string;

      if (fnMatch) {
        [, method, fullPath, lineNum] = fnMatch;
      } else {
        [, fullPath, lineNum] = fileMatch!;
      }

      if (
        fullPath.includes('/node_modules/') ||
        fullPath.includes('tracing.console-logger')
      )
        continue;

      const file = fullPath.split('/').pop() ?? fullPath;
      const methodPart = method ? `${method} ` : '';
      return `[${methodPart}${file}:${lineNum}]`;
    }
    return '[unknown]';
  }

  private fmt(
    level: string,
    message: unknown,
    ctx?: string,
    meta?: Record<string, unknown>,
  ) {
    ensureSeed();
    const metaAll = {
      execId: getExecId(),
      ...getMeta(),
      ...meta,
      ...(ctx ? { context: ctx } : {}),
    };
    const metaStr =
      Object.keys(metaAll).length > 0 ? ` ${JSON.stringify(metaAll)}` : '';
    const msg =
      typeof message === 'string'
        ? message
        : util.inspect(message, { depth: null, colors: false });
    const time = new Date().toISOString();
    return `${time} ${this.color(level)} ${msg} ${this.getLocation()}${metaStr}`;
  }

  private parseParams(params: unknown[]): {
    ctx?: string;
    meta?: Record<string, unknown>;
  } {
    let ctx: string | undefined;
    let meta: Record<string, unknown> | undefined;
    for (const p of params) {
      if (typeof p === 'string') ctx = p;
      else if (p && typeof p === 'object') meta = p as Record<string, unknown>;
    }
    return { ctx, meta };
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    const { ctx, meta } = this.parseParams(optionalParams);
    console.log(this.fmt('INFO', message, ctx, meta));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    const { ctx, meta } = this.parseParams(optionalParams);
    console.warn(this.fmt('WARN', message, ctx, meta));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    const { ctx, meta } = this.parseParams(optionalParams);
    console.debug(this.fmt('DEBUG', message, ctx, meta));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    const { ctx, meta } = this.parseParams(optionalParams);
    console.log(this.fmt('VERBOSE', message, ctx, meta));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    let stack: string | undefined;
    let ctx: string | undefined;
    let meta: Record<string, unknown> | undefined;

    for (const p of optionalParams) {
      if (typeof p === 'string' && !stack) stack = p;
      else if (typeof p === 'string') ctx = p;
      else if (p && typeof p === 'object') meta = p as Record<string, unknown>;
    }

    const line = this.fmt('ERROR', message, ctx, meta);
    if (stack) console.error(`${line}\n${stack}`);
    else console.error(line);
  }
}
