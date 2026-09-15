import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Message de contact stocké en MongoDB plutôt qu'en PostgreSQL.
 * Justification : structure volontairement libre (un visiteur peut ne
 * pas être un compte utilisateur enregistré), pas de contraintes
 * relationnelles nécessaires, volumétrie potentiellement importante et
 * peu structurée (spam, pièces jointes futures...). C'est un cas
 * d'usage typique de base NoSQL (Not Only SQL) : document autonome,
 * sans jointure.
 */
@Schema({ collection: 'contact_messages', timestamps: true })
export class ContactMessage extends Document {
  @Prop({ required: true })
  nom!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  telephone?: string;

  @Prop({ required: true })
  sujet!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: false })
  traite!: boolean;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
