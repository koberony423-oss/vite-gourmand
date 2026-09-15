import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

@Controller('utilisateurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UtilisateursController {
  constructor(private readonly service: UtilisateursService) {}

  @Get()
  @Roles('administrateur')
  findAll() {
    return this.service.findAll();
  }

  @Patch('moi')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { nom?: string; prenom?: string; numeroGsm?: string },
  ) {
    return this.service.updateProfile(user.sub, body);
  }

  @Patch(':id/role')
  @Roles('administrateur')
  updateRole(
    @Param('id') id: string,
    @Body('role') role: 'utilisateur' | 'employe' | 'administrateur',
  ) {
    return this.service.updateRole(id, role);
  }

  @Patch(':id/statut')
  @Roles('administrateur')
  setActif(@Param('id') id: string, @Body('actif') actif: boolean) {
    return this.service.setActif(id, actif);
  }
}
