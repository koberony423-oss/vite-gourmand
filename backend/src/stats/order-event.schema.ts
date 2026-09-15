import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Document MongoDB représentant un "évènement de commande".
 *
 * Justification du choix polyglotte (Postgres + MongoDB), point clé
 * pour la soutenance : la commande elle-même (source de vérité
 * transactionnelle, avec contraintes et clés étrangères) reste dans
 * PostgreSQL. Ce document Mongo est une COPIE dénormalisée, écrite en
 * plus, dédiée uniquement à l'analytique (nombre de commandes par menu,
 * chiffre d'affaires par thème...). Le schéma flexible de MongoDB permet
 * d'ajouter facilement de nouveaux indicateurs sans migration SQL, et
 * le framework d'agrégation Mongo (pipeline `$group`) est plus adapté
 * pour ce type de calcul que des requêtes SQL répétées.
 */
@Schema({ collection: 'order_events', timestamps: true })
export class OrderEvent extends Document {
  @Prop({ required: true })
  commandeId!: string;

  @Prop({ required: true })
  menuId!: string;

  @Prop({ required: true })
  menuTitre!: string;

  @Prop({ required: true })
  nbPersonnes!: number;

  @Prop({ required: true })
  prixTotal!: number;

  @Prop({ required: true })
  themeNom?: string;
}

export const OrderEventSchema = SchemaFactory.createForClass(OrderEvent);
