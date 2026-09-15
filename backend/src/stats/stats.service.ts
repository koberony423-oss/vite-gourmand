import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEvent } from './order-event.schema.js';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(OrderEvent.name) private readonly orderEventModel: Model<OrderEvent>,
  ) {}

  async recordOrder(data: {
    commandeId: string;
    menuId: string;
    menuTitre: string;
    nbPersonnes: number;
    prixTotal: number;
    themeNom?: string;
  }) {
    await this.orderEventModel.create(data);
  }

  /** Agrégation Mongo : nombre de commandes et chiffre d'affaires par menu. */
  async commandesParMenu() {
    return this.orderEventModel.aggregate([
      {
        $group: {
          _id: '$menuId',
          menuTitre: { $first: '$menuTitre' },
          nombreCommandes: { $sum: 1 },
          chiffreAffaires: { $sum: '$prixTotal' },
          totalConvives: { $sum: '$nbPersonnes' },
        },
      },
      { $sort: { nombreCommandes: -1 } },
    ]);
  }

  /** Agrégation Mongo : répartition des commandes par thème. */
  async commandesParTheme() {
    return this.orderEventModel.aggregate([
      {
        $group: {
          _id: '$themeNom',
          nombreCommandes: { $sum: 1 },
          chiffreAffaires: { $sum: '$prixTotal' },
        },
      },
      { $sort: { nombreCommandes: -1 } },
    ]);
  }
}
