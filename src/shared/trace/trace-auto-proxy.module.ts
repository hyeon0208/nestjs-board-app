// trace-auto-proxy.module.ts
import { Global, Module, Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { als, TraceStore, ensureSeed } from './context'; // ★ ensureSeed import

type AnyFn = (...args: unknown[]) => unknown;

function getMethodKeys(proto: object): string[] {
  const out: string[] = [];
  for (const k of Object.getOwnPropertyNames(proto)) {
    if (k === 'constructor') continue;
    const d = Object.getOwnPropertyDescriptor(proto, k);
    if (d && typeof d.value === 'function') out.push(k);
  }
  return out;
}

@Injectable()
class TraceAutoProxy implements OnModuleInit {
  constructor(private readonly discovery: DiscoveryService) {}

  onModuleInit() {
    const providers = this.discovery.getProviders();

    for (const w of providers) {
      const inst = (w as { instance?: unknown }).instance;
      if (!inst || typeof inst !== 'object') continue;

      const proto = Object.getPrototypeOf(inst as object);
      if (!proto || proto === Object.prototype) continue;

      for (const key of getMethodKeys(proto)) {
        const orig = (inst as Record<string, unknown>)[key];
        if (typeof orig !== 'function') continue;
        if ((orig as { __trace_wrapped__?: boolean }).__trace_wrapped__)
          continue;

        const cls = (proto as any).constructor?.name ?? 'Unknown';
        const label = `${cls}.${key}`;

        const wrapped: AnyFn = function (this: unknown, ...args: unknown[]) {
          const cur = als.getStore() ?? ensureSeed(); // ★ root 없으면 seed 생성
          const next: TraceStore = {
            ...cur,
            depth: cur.depth + 1,
            ctx: label,
          };
          // ★ orig 직접 호출
          return als.run(next, () => (orig as AnyFn).call(this, ...args));
        };
        (wrapped as { __trace_wrapped__?: boolean }).__trace_wrapped__ = true;

        Object.defineProperty(inst, key, {
          value: wrapped,
          writable: true,
          configurable: true,
        });
      }
    }
  }
}

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [TraceAutoProxy],
})
export class TraceAutoProxyModule {}
