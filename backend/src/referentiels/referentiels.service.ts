import { Injectable } from '@nestjs/common';
import { PgService } from '../common/pg.service.js';

@Injectable()
export class ReferentielsService {
  constructor(private readonly pg: PgService) {}

  themes() {
    return this.pg.query('select * from theme order by nom').then((r) => r.rows);
  }

  regimes() {
    return this.pg.query('select * from regime order by nom').then((r) => r.rows);
  }

  allergenes() {
    return this.pg.query('select * from allergene order by nom').then((r) => r.rows);
  }

  horaires() {
    return this.pg
      .query('select * from horaire order by jour_semaine')
      .then((r) => r.rows);
  }
}
