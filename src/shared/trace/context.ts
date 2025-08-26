// context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export type TraceStore = { execId: string; depth: number; ctx?: string };
export const als = new AsyncLocalStorage<TraceStore>();

export const getExecId = () => als.getStore()?.execId;
export const getDepth = () => als.getStore()?.depth ?? 0;
export const getCtx = () => als.getStore()?.ctx;

/**
AsyncLocalStorage 안에 최초 실행 컨텍스트(root TraceStore) 를 보장하기 위한 코드다.
“매번 새로운 값이 아니라, 한 번 만든 루트를 동일하게 공유해서 계속 쓸 수 있다”
 */
export function ensureSeed(seed?: Partial<TraceStore>): TraceStore {
  const s = als.getStore(); // // 현재 실행 컨텍스트(TraceStore) 가져오기
  if (s) return s; // // 이미 있으면 그대로 반환 (새로 만들지 않음)
  const root: TraceStore = {
    // 없으면 새로운 root TraceStore 생성
    execId: seed?.execId ?? randomUUID(),
    depth: 0,
    ctx: seed?.ctx, // 컨텍스트 라벨 (옵션)
  };
  als.enterWith(root); // 현재 실행 흐름에 root TraceStore를 주입
  return root; // 생성한 root 반환
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
