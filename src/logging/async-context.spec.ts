import { describe, it, expect, beforeEach } from 'vitest';

import { Ctx } from './async-context.js';
import { asyncContext } from './async-context.js';

describe('asyncContext', () => {
  beforeEach(() => {
    asyncContext.reset();
  });

  it('루트 컨텍스트에서 값을 저장하고 조회할 수 있다', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, () => {
      expect(asyncContext.get('workflowId')).toBe('wf-1');
      expect(asyncContext.get('scrapingJobId')).toBe('job-1');
      expect(asyncContext.get('executionId')).toBe('ex-1');
      expect(asyncContext.getAll()).toBe(root);
    });
  });

  it('서로 다른 start 호출 간에 컨텍스트가 격리된다', async () => {
    const root1: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };
    const root2: Ctx = {
      workflowId: 'wf-2',
      scrapingJobId: 'job-2',
      executionId: 'ex-2',
    };

    const result1 = await asyncContext.start(root1, () =>
      asyncContext.getAll(),
    );
    const result2 = await asyncContext.start(root2, () =>
      asyncContext.getAll(),
    );

    expect(result1).toBe(root1);
    expect(result2).toBe(root2);
  });

  it('startInherit 사용 시 부모 컨텍스트를 확장한 독립적인 컨텍스트를 갖는다.', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, async () => {
      await asyncContext.startWithParent({ userId: 'user-123' }, () => {
        expect(asyncContext.get('workflowId')).toBe('wf-1');
        expect(asyncContext.get('userId')).toBe('user-123');
      });
      expect(asyncContext.get('userId')).toBeUndefined();
    });
  });

  it('start 내부에서 start로 컨텍스트를 시작할 시 부모 컨텍스트와 독립적인 컨텍스트를 갖는다.', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, async () => {
      await asyncContext.start({ userId: 'user-123' }, () => {
        expect(asyncContext.get('workflowId')).toBeUndefined();
        expect(asyncContext.get('userId')).toBe('user-123');
      });
      expect(asyncContext.get('userId')).toBeUndefined();
    });
  });

  it('add으로 단건/다건 값을 저장할 수 있다', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, () => {
      asyncContext.add({ userId: 123 });
      expect(asyncContext.get('userId')).toBe(123);

      asyncContext.add({
        workflowId: 'wf-1',
        scrapingJobId: 'job-1',
        executionId: 'ex-1',
      });
      expect(asyncContext.get('workflowId')).toBe('wf-1');
      expect(asyncContext.get('scrapingJobId')).toBe('job-1');
      expect(asyncContext.get('executionId')).toBe('ex-1');
    });
  });

  it('async/await 경계에서도 컨텍스트가 유지된다', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, async () => {
      const delayed = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(asyncContext.get('workflowId') ?? 'none');
        }, 5);
      });

      await expect(delayed).resolves.toBe('wf-1');
    });
  });

  it('reset 시 컨텍스트를 초기화한다', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, () => {
      expect(asyncContext.get('workflowId')).toBe('wf-1');
      asyncContext.reset();
      expect(asyncContext.get('workflowId')).toBeUndefined();
    });
  });

  it('delete 시 컨텍스트에서 해당 키를 제거한다', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, () => {
      expect(asyncContext.get('workflowId')).toBe('wf-1');
      asyncContext.delete('workflowId');
      expect(asyncContext.get('workflowId')).toBeUndefined();
    });
  });

  it('replace 시 새로운 컨텍스트로 대체한다.', async () => {
    const root: Ctx = {
      workflowId: 'wf-1',
      scrapingJobId: 'job-1',
      executionId: 'ex-1',
    };

    await asyncContext.start(root, () => {
      asyncContext.replace({ workflowId: 'wf-2' });
      expect(asyncContext.get('workflowId')).toBe('wf-2');
      expect(asyncContext.get('scrapingJobId')).toBeUndefined();
      expect(asyncContext.get('executionId')).toBeUndefined();
    });
  });
});
