import { Injectable } from '@nestjs/common';
import { AlsLogger } from 'src/logging/als-logger.decorater';
import { asyncContext } from 'src/logging/async-context';
import { logger } from 'src/logging/syncly.logger';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function retry<T>(
  fn: () => Promise<T>,
  tries: number,
  minMs = 100,
  factor = 1.8,
  onAttempt?: (i: number, err: unknown) => void,
): Promise<T> {
  let delay = minMs,
    last: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      onAttempt?.(i, e);
      if (i === tries) break;
      await sleep(delay + Math.floor(Math.random() * 50));
      delay *= factor;
    }
  }
  throw last;
}

@Injectable()
export class ScrapService {
  constructor() {}

  @AlsLogger()
  async test() {
    asyncContext.add({ memo: '메모' });
    logger.info('test:in');
    await this.scrapeProducts(['P-1001', 'P-1002', 'P-1003']);
    logger.info('test:out');
  }

  async scrapeProducts(productIds: string[]) {
    logger.info('scrapeProducts:in', {
      count: productIds.length,
    });

    logger.debug('product:start');

    const pages = [1, 2, 3, 4, 5];

    await Promise.all(
      pages.map((page) =>
        retry(
          async () => {
            if (Math.random() < 0.35) throw new Error(`random-fail ${page}`);
            await sleep(60 + Math.floor(Math.random() * 120));
            const stats = {
              reviews: 20 + Math.floor(Math.random() * 10),
              avgScore: +(3 + Math.random() * 2).toFixed(2),
            };
            logger.info('page:ok', stats);
          },
          3,
          120,
          1.8,
          (i, err) =>
            logger.warn('page:retry', {
              attempt: i,
              reason: err,
            }),
        ).catch((e) => logger.error('product:failed', e)),
      ),
    );

    logger.debug('product:done');
    logger.info('scrapeProducts:out');
  }

  async countBoards() {
    await retry(
      async () => {
        if (Math.random() < 0.5) throw new Error('count transient');
        await sleep(80);
        logger.info('countBoards:ok', { total: 1234 });
      },
      4,
      100,
      1.8,
      (i, e) =>
        logger.warn('countBoards:retry', {
          attempt: i,
          reason: (e as Error).message,
        }),
    ).catch((e) => logger.error('countBoards:failed', e));
  }

  async loadMeta() {
    logger.info('loadMeta:in', { kinds: ['shop', 'category', 'brand'] });
    await sleep(120);
    if (Math.random() < 0.3)
      logger.warn('loadMeta:partial', { missing: ['brand'] });
    logger.info('loadMeta:out');
  }
}
