import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { asyncContext } from '../logging/async-context';
import { ScrapService } from './scrap.service';
import { AlsLogger } from '../logging/als-logger.decorater';
import { logger } from 'src/logging/syncly.logger';

@Controller('scrap')
export class ScrapController {
  constructor(private readonly scrap: ScrapService) {}

  @Get('test')
  @ApiOperation({ summary: '병렬 로깅 테스트' })
  @ApiOkResponse()
  @AlsLogger()
  async test() {
    const workflowId = `wf_${randomUUID()}`;
    const executionId = `ex_${randomUUID()}`;

    asyncContext.add({ workflowId, executionId });

    logger.info('controller:in', { endpoint: 'GET /scrap/test' });

    try {
      throw new Error('test error');
    } catch (e) {
      logger.error('controller:error', e);
    }

    await Promise.all([
      this.scrap.scrapeProducts([
        'P-1001',
        'P-1002',
        'P-1003',
        'P-1004',
        'P-1005',
      ]),
      asyncContext.startWithParent({ count: 'count' }, () =>
        this.scrap.countBoards(),
      ),
      asyncContext.startWithParent({ meta: 'meta' }, () =>
        this.scrap.loadMeta(),
      ),
    ]);

    logger.info('controller:out');
    return { ok: true, workflowId, executionId };
  }

  @Get('test2')
  @ApiOperation({ summary: '로깅 테스트2' })
  @ApiOkResponse()
  @AlsLogger()
  async test2() {
    const workflowId = `wf_${randomUUID()}`;
    const executionId = `ex_${randomUUID()}`;

    asyncContext.add({ workflowId, executionId });

    logger.info('controller:in', { endpoint: 'GET /scrap/test' });
    await Promise.all([this.scrap.test()]);

    logger.info('controller:out');
    return { ok: true, workflowId, executionId };
  }
}
