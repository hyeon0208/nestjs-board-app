// context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export type TraceStore = { execId: string; depth: number; ctx?: string };
export const als = new AsyncLocalStorage<TraceStore>();

export const getExecId = () => als.getStore()?.execId;
export const getDepth = () => als.getStore()?.depth ?? 0;
export const getCtx = () => als.getStore()?.ctx;

export function ensureSeed(seed?: Partial<TraceStore>): TraceStore {
  const s = als.getStore();
  if (s) return s;
  const root: TraceStore = {
    execId: seed?.execId ?? randomUUID(),
    depth: 0,
    ctx: seed?.ctx,
  };
  als.enterWith(root);
  return root;
}
// 엔트리에서 루트 보장
export function ensureRoot<T>(fn: () => T, seed?: Partial<TraceStore>) {
  const s = als.getStore();
  if (s) return fn();
  const root: TraceStore = {
    execId: seed?.execId ?? randomUUID(),
    depth: 0,
    ctx: seed?.ctx,
  };
  return als.run(root, fn);
}

// 깊이 +1 스팬(함수형)
export function span<T>(label: string, fn: () => T) {
  const p = als.getStore();
  const next: TraceStore = p
    ? { ...p, depth: p.depth + 1, ctx: label }
    : { execId: randomUUID(), depth: 0, ctx: label };
  return als.run(next, fn);
}

export function runGroup<T>(label: string, fn: () => T) {
  return span(label, fn);
}

export function beginSpan(
  label: string,
  seed?: Partial<TraceStore>,
): () => void {
  const p = als.getStore();
  const next: TraceStore = p
    ? { ...p, depth: p.depth + 1, ctx: label }
    : {
        execId: seed?.execId ?? randomUUID(),
        depth: 0,
        ctx: label,
      };
  als.enterWith(next);
  return () => {
    if (p) als.enterWith(p);
    else als.enterWith({ execId: randomUUID(), depth: 0 });
  };
}
