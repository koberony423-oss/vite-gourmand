import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from '../common/pg.service.js';

@Injectable()
export class AvisService {
  constructor(private readonly pg: PgService) {}

  async create(userId: string, commandeId: string, note: number, commentaire?: string) {
    const commande = await this.pg.query(
      'select id from commande where id = $1 and utilisateur_id = $2',
      [commandeId, userId],
    );
    if (!commande.rowCount) {
      throw new NotFoundException('Commande introuvable pour cet utilisateur');
    }
    const result = await this.pg.query(
      `insert into avis (commande_id, utilisateur_id, note, commentaire)
       values ($1, $2, $3, $4) returning *`,
      [commandeId, userId, note, commentaire ?? null],
    );
    return result.rows[0];
  }

  async findPublics() {
    const result = await this.pg.query(
      `select a.*, u.prenom from avis a
       join utilisateur u on u.id = a.utilisateur_id
       where a.valide = true order by a.created_at desc limit 20`,
    );
    return result.rows;
  }

  async findAllAdmin() {
    const result = await this.pg.query(
      `select a.*, u.nom, u.prenom from avis a
       join utilisateur u on u.id = a.utilisateur_id
       order by a.created_at desc`,
    );
    return result.rows;
  }

  async valider(id: string, valide: boolean) {
    const result = await this.pg.query(
      'update avis set valide = $2 where id = $1 returning *',
      [id, valide],
    );
    if (!result.rowCount) throw new NotFoundException('Avis introuvable');
    return result.rows[0];
  }
}
