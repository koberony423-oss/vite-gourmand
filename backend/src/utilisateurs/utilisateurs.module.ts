import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service.js';
import { UtilisateursController } from './utilisateurs.controller.js';

@Module({
  providers: [UtilisateursService],
  controllers: [UtilisateursController],
})
export class UtilisateursModule {}
