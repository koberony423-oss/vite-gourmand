import { Module } from '@nestjs/common';
import { PlatsService } from './plats.service.js';
import { PlatsController } from './plats.controller.js';

@Module({
  providers: [PlatsService],
  controllers: [PlatsController],
  exports: [PlatsService],
})
export class PlatsModule {}
