import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { als } from './context';

@Injectable()
export class MethodSpanInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const s = als.getStore();
    const nextStore = s
      ? { ...s, depth: s.depth + 1 }
      : { execId: crypto.randomUUID(), depth: 0 };
    return als.run(nextStore, () => next.handle());
  }
}
