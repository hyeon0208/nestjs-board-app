import { Injectable, LoggerService } from '@nestjs/common';
import { ensureSeed, getCtx, getDepth, getExecId } from './context';

const ts = () => new Date().toISOString();

@Injectable()
export class TracingLogger implements LoggerService {
  private head(level: string, ctx?: string) {
    ensureSeed();
    const id = getExecId() ?? '–';
    const depth = Math.max(0, getDepth() - 1);
    const tag = ctx ?? getCtx() ?? '';
    return `[${ts()}] [${level}] [${id}] [depth=${depth}]${tag ? ` [${tag}]` : ''}`;
  }
  private body(m: unknown) {
    if (typeof m === 'string') return m;
    if (m instanceof Error) return `${m.message}\n${m.stack ?? ''}`;
    try {
      return JSON.stringify(m);
    } catch {
      return String(m);
    }
  }
  log(m: any, c?: string) {
    console.log(`${this.head('LOG', c)} ${this.body(m)}`);
  }
  warn(m: any, c?: string) {
    console.warn(`${this.head('WARN', c)} ${this.body(m)}`);
  }
  error(m: any, s?: string, c?: string) {
    console.error(
      `${this.head('ERROR', c)} ${this.body(s ? `${m}\n${s}` : m)}`,
    );
  }
  debug(m: any, c?: string) {
    console.debug?.(`${this.head('DEBUG', c)} ${this.body(m)}`);
  }
  verbose(m: any, c?: string) {
    console.info?.(`${this.head('VERBOSE', c)} ${this.body(m)}`);
  }
}
