import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrateur', 'employe')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('commandes-par-menu')
  commandesParMenu() {
    return this.service.commandesParMenu();
  }

  @Get('commandes-par-theme')
  commandesParTheme() {
    return this.service.commandesParTheme();
  }
}
