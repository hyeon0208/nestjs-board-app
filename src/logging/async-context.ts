import { AsyncLocalStorage } from 'node:async_hooks';

export type BaseCtx = {
  workflowId: string;
  executionId: string;
};

export type Ctx = BaseCtx & Record<string, unknown>;

class AsyncContext {
  private static instance: AsyncContext;
  private readonly store = new AsyncLocalStorage<Ctx>();

  private constructor() {}

  public static getInstance(): AsyncContext {
    if (!AsyncContext.instance) {
      AsyncContext.instance = new AsyncContext();
    }
    return AsyncContext.instance;
  }

  get<K extends keyof Ctx>(k: K): Ctx[K] | undefined {
    return this.store.getStore()?.[k];
  }

  getAll(): Readonly<Ctx> {
    return this.store.getStore() ?? ({} as Ctx);
  }

  add(values: Partial<Ctx>) {
    const store = this.store.getStore();
    if (store) {
      Object.assign(store, values);
    }
  }

  delete(k: keyof Ctx) {
    const store = this.store.getStore();
    if (store) {
      delete store[k];
    }
  }

  start<T>(root: Partial<Ctx>, fn: () => Promise<T> | T): Promise<T> | T {
    return this.store.run(root as Ctx, fn);
  }

  startWithParent<T>(
    root: Partial<Ctx>,
    fn: () => Promise<T> | T,
  ): Promise<T> | T {
    const parent = this.store.getStore() ?? ({} as Ctx);
    const next = { ...parent, ...root } as Ctx;
    return this.store.run(next, fn);
  }

  replace(values: Partial<Ctx>) {
    this.store.enterWith(values as Ctx);
  }

  reset() {
    this.store.disable?.();
  }
}

export const asyncContext = AsyncContext.getInstance();
