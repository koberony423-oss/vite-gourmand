import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PgService } from '../common/pg.service.js';
import { StatsService } from '../stats/stats.service.js';
import { calculerPrix } from './pricing.util.js';
import type { CreateCommandeDto } from './dto/create-commande.dto.js';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

const STATUTS_VALIDES = [
  'en_attente',
  'accepte',
  'en_preparation',
  'en_cours_de_livraison',
  'livre',
  'en_attente_du_retour_de_materiel',
  'terminee',
  'annulee',
] as const;

@Injectable()
export class CommandesService {
  constructor(
    private readonly pg: PgService,
    private readonly stats: StatsService,
  ) {}

  async create(userId: string, dto: CreateCommandeDto) {
    const menuResult = await this.pg.query(
      `select m.*, t.nom as theme_nom from menu m
       left join theme t on t.id = m.theme_id
       where m.id = $1 and m.actif = true`,
      [dto.menuId],
    );
    if (!menuResult.rowCount) throw new NotFoundException('Menu introuvable');
    const menu = menuResult.rows[0];

    if (menu.stock_disponible <= 0) {
      throw new BadRequestException('Ce menu est en rupture de stock');
    }

    if (dto.nbPersonnes < menu.nb_personnes_min) {
      throw new BadRequestException(
        `Ce menu requiert au moins ${menu.nb_personnes_min} personnes`,
      );
    }

    const delaiMs = menu.delai_commande_jours * 24 * 60 * 60 * 1000;
    const datePrestation = new Date(dto.datePrestation);
    if (datePrestation.getTime() - Date.now() < delaiMs) {
      throw new BadRequestException(
        `Ce menu doit être commandé au moins ${menu.delai_commande_jours} jours à l'avance`,
      );
    }

    const distanceKm = dto.distanceKm ?? 0;
    const pricing = calculerPrix({
      prixPourMin: Number(menu.prix_pour_min),
      nbPersonnesMin: menu.nb_personnes_min,
      nbPersonnes: dto.nbPersonnes,
      distanceKm,
    });

    const result = await this.pg.query(
      `insert into commande
         (utilisateur_id, menu_id, nb_personnes, adresse_livraison_id, distance_km,
          date_prestation, heure_souhaitee, prix_menu, prix_livraison, taux_remise, prix_total)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       returning *`,
      [
        userId,
        dto.menuId,
        dto.nbPersonnes,
        dto.adresseLivraisonId ?? null,
        distanceKm,
        dto.datePrestation,
        dto.heureSouhaitee,
        pricing.prixMenu,
        pricing.prixLivraison,
        pricing.tauxRemise,
        pricing.prixTotal,
      ],
    );
    const commande = result.rows[0];

    // Décrément du stock : une commande réserve une unité du menu.
    await this.pg.query(
      'update menu set stock_disponible = stock_disponible - 1 where id = $1 and stock_disponible > 0',
      [menu.id],
    );

    await this.pg.query(
      `insert into commande_statut_historique (commande_id, statut, commentaire)
       values ($1, 'en_attente', 'Commande créée par le client')`,
      [commande.id],
    );

    // Écriture analytique en MongoDB (voir stats.service.ts pour la justification).
    await this.stats.recordOrder({
      commandeId: commande.id,
      menuId: menu.id,
      menuTitre: menu.titre,
      nbPersonnes: dto.nbPersonnes,
      prixTotal: pricing.prixTotal,
      themeNom: menu.theme_nom,
    });

    return commande;
  }

  async findAllForUser(userId: string) {
    const result = await this.pg.query(
      `select c.*, m.titre as menu_titre
       from commande c join menu m on m.id = c.menu_id
       where c.utilisateur_id = $1
       order by c.created_at desc`,
      [userId],
    );
    return result.rows;
  }

  async findAllAdmin() {
    const result = await this.pg.query(
      `select c.*, m.titre as menu_titre, u.nom, u.prenom, u.email
       from commande c
       join menu m on m.id = c.menu_id
       join utilisateur u on u.id = c.utilisateur_id
       order by c.created_at desc`,
    );
    return result.rows;
  }

  async findOne(id: string, requester: AuthenticatedUser) {
    const result = await this.pg.query(
      `select c.*, m.titre as menu_titre from commande c
       join menu m on m.id = c.menu_id where c.id = $1`,
      [id],
    );
    if (!result.rowCount) throw new NotFoundException('Commande introuvable');
    const commande = result.rows[0];
    const estProprietaire = commande.utilisateur_id === requester.sub;
    const estPersonnel = requester.role === 'employe' || requester.role === 'administrateur';
    if (!estProprietaire && !estPersonnel) {
      throw new ForbiddenException('Accès refusé à cette commande');
    }

    const historique = await this.pg.query(
      'select * from commande_statut_historique where commande_id = $1 order by date_changement',
      [id],
    );
    return { ...commande, historique: historique.rows };
  }

  async updateStatut(id: string, statut: string, commentaire?: string) {
    if (!STATUTS_VALIDES.includes(statut as typeof STATUTS_VALIDES[number])) {
      throw new BadRequestException('Statut invalide');
    }
    const result = await this.pg.query(
      'update commande set statut = $2, updated_at = now() where id = $1 returning *',
      [id, statut],
    );
    if (!result.rowCount) throw new NotFoundException('Commande introuvable');

    await this.pg.query(
      `insert into commande_statut_historique (commande_id, statut, commentaire)
       values ($1, $2, $3)`,
      [id, statut, commentaire ?? null],
    );
    return result.rows[0];
  }

  async annuler(
    id: string,
    employeId: string,
    motif: string,
    moyenContact: string,
  ) {
    const commande = await this.pg.query(
      'select id, menu_id, statut from commande where id = $1',
      [id],
    );
    if (!commande.rowCount) throw new NotFoundException('Commande introuvable');
    if (commande.rows[0].statut === 'annulee') {
      throw new BadRequestException('Commande déjà annulée');
    }

    // Restitution du stock réservé par la commande annulée.
    await this.pg.query(
      'update menu set stock_disponible = stock_disponible + 1 where id = $1',
      [commande.rows[0].menu_id],
    );

    await this.pg.query(
      `insert into annulation (commande_id, employe_id, motif, moyen_contact)
       values ($1, $2, $3, $4)`,
      [id, employeId, motif, moyenContact],
    );
    return this.updateStatut(id, 'annulee', `Annulée : ${motif}`);
  }
}
