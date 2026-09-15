import { Controller, Get } from '@nestjs/common';
import { ReferentielsService } from './referentiels.service.js';

@Controller()
export class ReferentielsController {
  constructor(private readonly service: ReferentielsService) {}

  @Get('themes')
  themes() {
    return this.service.themes();
  }

  @Get('regimes')
  regimes() {
    return this.service.regimes();
  }

  @Get('allergenes')
  allergenes() {
    return this.service.allergenes();
  }

  @Get('horaires')
  horaires() {
    return this.service.horaires();
  }
}
