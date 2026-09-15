import { Module } from '@nestjs/common';
import { ReferentielsService } from './referentiels.service.js';
import { ReferentielsController } from './referentiels.controller.js';

@Module({
  providers: [ReferentielsService],
  controllers: [ReferentielsController],
})
export class ReferentielsModule {}
