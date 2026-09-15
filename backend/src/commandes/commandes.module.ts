import { Module } from '@nestjs/common';
import { CommandesService } from './commandes.service.js';
import { CommandesController } from './commandes.controller.js';
import { StatsModule } from '../stats/stats.module.js';

@Module({
  imports: [StatsModule],
  providers: [CommandesService],
  controllers: [CommandesController],
})
export class CommandesModule {}
