import { Module } from '@nestjs/common';
import { AvisService } from './avis.service.js';
import { AvisController } from './avis.controller.js';

@Module({
  providers: [AvisService],
  controllers: [AvisController],
})
export class AvisModule {}
