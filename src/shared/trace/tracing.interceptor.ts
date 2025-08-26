import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { addMeta, ensureRoot } from './context';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return ensureRoot(() => {
      const req = ctx.switchToHttp().getRequest<{
        headers?: Record<string, unknown>;
        user?: { id?: string };
      }>();
      if (req) {
        const meta: Record<string, unknown> = {};
        const reqId = req.headers?.['x-request-id'];
        if (typeof reqId === 'string') meta.requestId = reqId;
        const userId = req.user?.id;
        if (typeof userId === 'string') meta.userId = userId;
        if (Object.keys(meta).length) addMeta(meta);
      }
      return next.handle();
    });
  }
}
