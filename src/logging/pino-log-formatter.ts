import pino, { LoggerOptions } from 'pino';
import { asyncContext } from './async-context';
import { LogLevel } from './syncly.logger';

export function buildPinoLoggerFormatOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL ?? LogLevel.INFO,
    base: { workerId: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin: () => ({
      ...asyncContext.getAll(),
      ...getLocationInfo(),
    }),
    // messageKey = “로그 메시지가 저장될 JSON 키 이름”
    // 기본 "msg", 보통 "message"로 바꿔서 사람이 읽기 좋게 씀
    // json 형식으로 출력 시킬 때 msg가 아닌 message로 출력되길 의도했는데
    // messageKey를 사용하면 항상 message가 마지막 순서로 나오게 됨. 순서는 강제할 수 없다 → 순서를 제어하려면 messageKey를 안쓰는게 나음.
    // messageKey: 'message',
    formatters: {
      level: (label) => ({ level: label }),
    },
    hooks: {
      // 로그 호출 시점에 인자 가공
      // pino의 로거 인자는 obj, msg 라서 logger.info('메시지', { foo: 1, bar: 2})로 출력하면 2번쨰 인자는 출력되지 않음. 그래서 기존 로거 출력 방식으로 맞추기 위해 순서 swap
      logMethod(args, method) {
        const [firstArg, secondArg, ...rest] = args as unknown[];

        if (
          typeof firstArg === 'string' &&
          secondArg &&
          typeof secondArg === 'object'
        ) {
          return (method as any).apply(this, [secondArg, firstArg, ...rest]);
        }
        return (method as any).apply(this, args);
      },
    },
  };
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
