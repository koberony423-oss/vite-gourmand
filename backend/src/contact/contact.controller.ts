import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrateur', 'employe')
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/traite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrateur', 'employe')
  marquerTraite(@Param('id') id: string, @Body('traite') traite: boolean) {
    return this.service.marquerTraite(id, traite);
  }
}
