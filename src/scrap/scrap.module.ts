import { Module } from '@nestjs/common';
import { ScrapService } from './scrap.service';
import { ScrapController } from './scrap.controller';

@Module({
  providers: [ScrapService],
  controllers: [ScrapController],
})
export class ScrapModule {}
