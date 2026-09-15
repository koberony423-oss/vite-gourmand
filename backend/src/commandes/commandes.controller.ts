import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandesService } from './commandes.service.js';
import { CreateCommandeDto } from './dto/create-commande.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

@Controller('commandes')
@UseGuards(JwtAuthGuard)
export class CommandesController {
  constructor(private readonly service: CommandesService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCommandeDto) {
    return this.service.create(user.sub, dto);
  }

  @Get('moi')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAllForUser(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('administrateur', 'employe')
  findAll() {
    return this.service.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/statut')
  @UseGuards(RolesGuard)
  @Roles('administrateur', 'employe')
  updateStatut(@Param('id') id: string, @Body('statut') statut: string, @Body('commentaire') commentaire?: string) {
    return this.service.updateStatut(id, statut, commentaire);
  }

  @Patch(':id/annuler')
  @UseGuards(RolesGuard)
  @Roles('administrateur', 'employe')
  annuler(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('motif') motif: string,
    @Body('moyenContact') moyenContact: string,
  ) {
    return this.service.annuler(id, user.sub, motif, moyenContact);
  }
}
