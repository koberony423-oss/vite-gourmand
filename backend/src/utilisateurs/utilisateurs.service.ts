import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from '../common/pg.service.js';

@Injectable()
export class UtilisateursService {
  constructor(private readonly pg: PgService) {}

  async findAll() {
    const result = await this.pg.query(
      `select id, nom, prenom, email, numero_gsm, role, actif, created_at
       from utilisateur order by created_at desc`,
    );
    return result.rows;
  }

  async updateRole(id: string, role: 'utilisateur' | 'employe' | 'administrateur') {
    const result = await this.pg.query(
      'update utilisateur set role = $2, updated_at = now() where id = $1 returning id, nom, prenom, email, role',
      [id, role],
    );
    if (!result.rowCount) throw new NotFoundException('Utilisateur introuvable');
    return result.rows[0];
  }

  async setActif(id: string, actif: boolean) {
    const result = await this.pg.query(
      'update utilisateur set actif = $2, updated_at = now() where id = $1 returning id, actif',
      [id, actif],
    );
    if (!result.rowCount) throw new NotFoundException('Utilisateur introuvable');
    return result.rows[0];
  }

  async updateProfile(
    id: string,
    data: { nom?: string; prenom?: string; numeroGsm?: string },
  ) {
    const result = await this.pg.query(
      `update utilisateur set
         nom = coalesce($2, nom),
         prenom = coalesce($3, prenom),
         numero_gsm = coalesce($4, numero_gsm),
         updated_at = now()
       where id = $1
       returning id, nom, prenom, email, numero_gsm, role`,
      [id, data.nom ?? null, data.prenom ?? null, data.numeroGsm ?? null],
    );
    if (!result.rowCount) throw new NotFoundException('Utilisateur introuvable');
    return result.rows[0];
  }
}
