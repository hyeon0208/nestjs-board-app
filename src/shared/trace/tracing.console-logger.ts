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
      const match =
        line.match(/\(([^)]+):(\d+):\d+\)/) ||
        line.match(/at ([^ ]+):(\d+):\d+/);
      if (!match) continue;
      const fullPath = match[1];
      if (
        fullPath.includes('/node_modules/') ||
        fullPath.includes('tracing.console-logger')
      )
        continue;
      const file = fullPath.split('/').pop() ?? fullPath;
      const lineNum = match[2];
      return `[${file}:${lineNum}]`;
    }
    return '[unknown]';
  }

  private fmt(level: string, message: unknown, ctx?: string) {
    ensureSeed();
    const meta = {
      execId: getExecId(),
      ...getMeta(),
      ...(ctx ? { context: ctx } : {}),
    };
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const msg =
      typeof message === 'string'
        ? message
        : util.inspect(message, { depth: null, colors: false });
    return `${this.color(level)} ${msg} ${this.getLocation()}${metaStr}`;
  }

  private pickContext(params: unknown[]): string | undefined {
    return params.find((v) => typeof v === 'string');
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.fmt('INFO', message, this.pickContext(optionalParams)));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(this.fmt('WARN', message, this.pickContext(optionalParams)));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    console.debug(this.fmt('DEBUG', message, this.pickContext(optionalParams)));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.fmt('VERBOSE', message, this.pickContext(optionalParams)));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    let stack: string | undefined;
    let ctx: string | undefined;
    if (optionalParams.length > 0) {
      const [s, c] = optionalParams as [unknown, unknown];
      if (typeof s === 'string') stack = s;
      if (typeof c === 'string') ctx = c;
    }
    const line = this.fmt('ERROR', message, ctx);
    if (stack) console.error(`${line}\n${stack}`);
    else console.error(line);
  }
}
