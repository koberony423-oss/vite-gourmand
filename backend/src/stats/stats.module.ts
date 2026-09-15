import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service.js';
import { StatsController } from './stats.controller.js';
import { OrderEvent, OrderEventSchema } from './order-event.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrderEvent.name, schema: OrderEventSchema }]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
