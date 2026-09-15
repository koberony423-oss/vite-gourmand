import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AvisService } from './avis.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

@Controller('avis')
export class AvisController {
  constructor(private readonly service: AvisService) {}

  @Get()
  findPublics() {
    return this.service.findPublics();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body('commandeId') commandeId: string,
    @Body('note') note: number,
    @Body('commentaire') commentaire?: string,
  ) {
    return this.service.create(user.sub, commandeId, note, commentaire);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrateur', 'employe')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Patch(':id/valider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrateur')
  valider(@Param('id') id: string, @Body('valide') valide: boolean) {
    return this.service.valider(id, valide);
  }
}
