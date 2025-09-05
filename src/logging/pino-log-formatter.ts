import pino, { LoggerOptions } from 'pino';
import { asyncContext } from './async-context';

export function buildPinoLoggerFormatOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL ?? 'info',
    base: { workerId: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin: () => ({
      ...asyncContext.getAll(),
      ...getLocationInfo(),
    }),
    messageKey: 'message',
    errorKey: 'error',
    formatters: {
      level: (label) => ({ level: label }),
    },
    hooks: {
      logMethod(args, method) {
        const { msg, obj } = normalizeLogArgs(args as unknown[]);
        (method as any).apply(this, obj ? [obj, msg] : [msg]);
      },
    },
    serializers: {
      error: pino.stdSerializers.err,
    },
  };
}

function normalizeLogArgs(args: unknown[]) {
  const [first, ...rest] = args;
  const msg = typeof first === 'string' ? first : JSON.stringify(first);
  const meta: Record<string, unknown> = {};

  for (const cur of rest) {
    if (cur && typeof cur === 'object') {
      Object.assign(meta, normalizePlain(cur));
    } else if (['string', 'number', 'boolean'].includes(typeof cur)) {
      if (!meta.extra) {
        meta.extra = [];
      }
      (meta.extra as unknown[]).push(cur);
    }
  }

  return Object.keys(meta).length ? { msg, obj: meta } : { msg };
}

function normalizePlain(input: unknown, visited = new WeakSet()): unknown {
  if (input instanceof Error) {
    return {
      name: input.name,
      message: input.message,
      stack: input.stack,
    };
  }
  if (Array.isArray(input)) {
    return input.map((item) => normalizePlain(item, visited));
  }
  if (input && typeof input === 'object') {
    if (visited.has(input)) {
      return { circular: true };
    }
    visited.add(input);
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, normalizePlain(v, visited)]),
    );
  }
  return input;
}

// 현재 호출한 함수의 "호출자 정보(메서드명, 파일, 라인 번호)"를 뽑아내는 유틸
function getLocationInfo(): { method?: string; location: string } {
  // 줄 단위로 나눈 뒤 앞의 7줄은 버려서(로거/내부 호출 부분 제거 목적) 실제 비즈니스 코드 쪽 프레임만 남김.
  const stack = new Error().stack?.split('\n').slice(7) ?? [];

  // 순회하면서 Logger.나 console.이 포함된 줄은 스킵 → 로거 자체 내부 프레임은 무시.
  for (const line of stack) {
    if (line.includes('Logger.') || line.includes('console.')) continue;

    // stack 문자열 한 줄이 보통 "at 함수명 (파일경로:라인:컬럼)" 꼴이라서 정규식으로 함수명, 파일 경로, 라인번호 추출.
    // 함수명이 없을 경우에는 "at 파일경로:라인:컬럼" 형태도 잡도록 두 가지 정규식을 씀.
    const fnMatch = line.match(/at (.+?) \(([^)]+):(\d+):\d+\)/);
    const fileMatch = line.match(/at ([^ ]+):(\d+):\d+/);

    let method: string | undefined;
    let fullPath: string | undefined;
    let lineNum: string | undefined;

    // 매치된 경우 배열 구조분해 할당으로 함수명(method), 파일 경로(fullPath), 라인(lineNum) 추출.
    if (fnMatch) {
      [, method, fullPath, lineNum] = fnMatch;
    } else if (fileMatch) {
      [, fullPath, lineNum] = fileMatch;
    }

    // 경로가 없거나 node_modules 안이면 스킵. 즉 사용자 코드만 찾겠다는 의미.
    if (!fullPath || fullPath.includes('/node_modules/')) continue;

    // 파일 경로 끝부분(파일명만) 잘라서 파일명:라인 형식으로 반환.
    const file = fullPath.split('/').pop() ?? fullPath;
    return { method, location: `${file}:${lineNum}` };
  }
  return { location: 'unknown' };
}
