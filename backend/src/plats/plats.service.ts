import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from '../common/pg.service.js';

interface PlatInput {
  nom: string;
  type: 'entree' | 'plat' | 'dessert';
  description?: string;
  allergeneIds?: string[];
}

@Injectable()
export class PlatsService {
  constructor(private readonly pg: PgService) {}

  async findAll() {
    const result = await this.pg.query(`
      select p.*, coalesce(
        json_agg(a.nom) filter (where a.nom is not null), '[]'
      ) as allergenes
      from plat p
      left join plat_allergene pa on pa.plat_id = p.id
      left join allergene a on a.id = pa.allergene_id
      group by p.id
      order by p.type, p.nom
    `);
    return result.rows;
  }

  async create(input: PlatInput) {
    const result = await this.pg.query(
      'insert into plat (nom, type, description) values ($1, $2, $3) returning *',
      [input.nom, input.type, input.description ?? null],
    );
    const plat = result.rows[0];
    if (input.allergeneIds?.length) {
      await this.linkAllergenes(plat.id, input.allergeneIds);
    }
    return plat;
  }

  async update(id: string, input: Partial<PlatInput>) {
    const result = await this.pg.query(
      `update plat set
         nom = coalesce($2, nom),
         type = coalesce($3, type),
         description = coalesce($4, description)
       where id = $1 returning *`,
      [id, input.nom ?? null, input.type ?? null, input.description ?? null],
    );
    if (!result.rowCount) throw new NotFoundException('Plat introuvable');
    if (input.allergeneIds) {
      await this.pg.query('delete from plat_allergene where plat_id = $1', [id]);
      await this.linkAllergenes(id, input.allergeneIds);
    }
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.pg.query('delete from plat where id = $1', [id]);
    if (!result.rowCount) throw new NotFoundException('Plat introuvable');
    return { ok: true };
  }

  private async linkAllergenes(platId: string, allergeneIds: string[]) {
    for (const allergeneId of allergeneIds) {
      await this.pg.query(
        'insert into plat_allergene (plat_id, allergene_id) values ($1, $2) on conflict do nothing',
        [platId, allergeneId],
      );
    }
  }
}
