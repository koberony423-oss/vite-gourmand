import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from '../common/pg.service.js';

interface MenuFilters {
  themeId?: string;
  regimeId?: string;
}

interface MenuInput {
  titre: string;
  description?: string;
  themeId?: string;
  regimeId?: string;
  nbPersonnesMin: number;
  prixPourMin: number;
  delaiCommandeJours?: number;
  precautionsStockage?: string;
  stockDisponible?: number;
  galerieImages?: string[];
  platIds?: string[];
}

@Injectable()
export class MenusService {
  constructor(private readonly pg: PgService) {}

  async findAll(filters: MenuFilters) {
    const conditions: string[] = ['m.actif = true'];
    const params: unknown[] = [];
    if (filters.themeId) {
      params.push(filters.themeId);
      conditions.push(`m.theme_id = $${params.length}`);
    }
    if (filters.regimeId) {
      params.push(filters.regimeId);
      conditions.push(`m.regime_id = $${params.length}`);
    }

    const result = await this.pg.query(
      `select m.*, t.nom as theme_nom, r.nom as regime_nom
       from menu m
       left join theme t on t.id = m.theme_id
       left join regime r on r.id = m.regime_id
       where ${conditions.join(' and ')}
       order by m.created_at desc`,
      params,
    );
    return result.rows;
  }

  async findOne(id: string) {
    const menuResult = await this.pg.query(
      `select m.*, t.nom as theme_nom, r.nom as regime_nom
       from menu m
       left join theme t on t.id = m.theme_id
       left join regime r on r.id = m.regime_id
       where m.id = $1`,
      [id],
    );
    if (!menuResult.rowCount) throw new NotFoundException('Menu introuvable');

    const platsResult = await this.pg.query(
      `select p.*, coalesce(
         json_agg(a.nom) filter (where a.nom is not null), '[]'
       ) as allergenes
       from propose pr
       join plat p on p.id = pr.plat_id
       left join plat_allergene pa on pa.plat_id = p.id
       left join allergene a on a.id = pa.allergene_id
       where pr.menu_id = $1
       group by p.id
       order by p.type, p.nom`,
      [id],
    );

    return { ...menuResult.rows[0], plats: platsResult.rows };
  }

  async create(input: MenuInput) {
    const result = await this.pg.query(
      `insert into menu
         (titre, description, theme_id, regime_id, nb_personnes_min, prix_pour_min,
          delai_commande_jours, precautions_stockage, stock_disponible, galerie_images)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning *`,
      [
        input.titre,
        input.description ?? null,
        input.themeId ?? null,
        input.regimeId ?? null,
        input.nbPersonnesMin,
        input.prixPourMin,
        input.delaiCommandeJours ?? 7,
        input.precautionsStockage ?? null,
        input.stockDisponible ?? 0,
        input.galerieImages ?? [],
      ],
    );
    const menu = result.rows[0];
    if (input.platIds?.length) await this.linkPlats(menu.id, input.platIds);
    return menu;
  }

  async update(id: string, input: Partial<MenuInput>) {
    const result = await this.pg.query(
      `update menu set
         titre = coalesce($2, titre),
         description = coalesce($3, description),
         theme_id = coalesce($4, theme_id),
         regime_id = coalesce($5, regime_id),
         nb_personnes_min = coalesce($6, nb_personnes_min),
         prix_pour_min = coalesce($7, prix_pour_min),
         delai_commande_jours = coalesce($8, delai_commande_jours),
         precautions_stockage = coalesce($9, precautions_stockage),
         stock_disponible = coalesce($10, stock_disponible),
         updated_at = now()
       where id = $1
       returning *`,
      [
        id,
        input.titre ?? null,
        input.description ?? null,
        input.themeId ?? null,
        input.regimeId ?? null,
        input.nbPersonnesMin ?? null,
        input.prixPourMin ?? null,
        input.delaiCommandeJours ?? null,
        input.precautionsStockage ?? null,
        input.stockDisponible ?? null,
      ],
    );
    if (!result.rowCount) throw new NotFoundException('Menu introuvable');
    if (input.platIds) {
      await this.pg.query('delete from propose where menu_id = $1', [id]);
      await this.linkPlats(id, input.platIds);
    }
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.pg.query(
      'update menu set actif = false where id = $1 returning id',
      [id],
    );
    if (!result.rowCount) throw new NotFoundException('Menu introuvable');
    return { ok: true };
  }

  private async linkPlats(menuId: string, platIds: string[]) {
    for (const platId of platIds) {
      await this.pg.query(
        'insert into propose (menu_id, plat_id) values ($1, $2) on conflict do nothing',
        [menuId, platId],
      );
    }
  }
}
