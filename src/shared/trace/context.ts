// context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

// TraceStore는 실행 식별자와 임의의 메타데이터만 보관한다.
export type TraceStore = {
  execId: string;
  meta?: Record<string, any>;
};
export const als = new AsyncLocalStorage<TraceStore>();

export const getExecId = () => als.getStore()?.execId;
export const getMeta = () => als.getStore()?.meta ?? {};

export function addMeta(meta: Record<string, any>) {
  const store = als.getStore();
  if (store) store.meta = { ...(store.meta ?? {}), ...meta };
  else ensureSeed({ meta });
}

/**
AsyncLocalStorage 안에 최초 실행 컨텍스트(root TraceStore) 를 보장하기 위한 코드다.
“매번 새로운 값이 아니라, 한 번 만든 루트를 동일하게 공유해서 계속 쓸 수 있다”
 */
export function ensureSeed(seed?: Partial<TraceStore>): TraceStore {
  const s = als.getStore();
  if (s) return s;
  const root: TraceStore = {
    execId: seed?.execId ?? randomUUID(),
    meta: seed?.meta ?? {},
  };
  als.enterWith(root);
  return root;
}

// 실행 엔트리에서 루트 TraceStore를 보장한다.
export function ensureRoot<T>(fn: () => T, seed?: Partial<TraceStore>) {
  const s = als.getStore();
  if (s) return fn();
  const root: TraceStore = {
    execId: seed?.execId ?? randomUUID(),
    meta: seed?.meta ?? {},
  };
  return als.run(root, fn);
}
