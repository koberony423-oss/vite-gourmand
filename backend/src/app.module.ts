import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PgModule } from './common/pg.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module.js';
import { ReferentielsModule } from './referentiels/referentiels.module.js';
import { PlatsModule } from './plats/plats.module.js';
import { MenusModule } from './menus/menus.module.js';
import { CommandesModule } from './commandes/commandes.module.js';
import { AvisModule } from './avis/avis.module.js';
import { ContactModule } from './contact/contact.module.js';
import { StatsModule } from './stats/stats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    PgModule,
    AuthModule,
    UtilisateursModule,
    ReferentielsModule,
    PlatsModule,
    MenusModule,
    CommandesModule,
    AvisModule,
    ContactModule,
    StatsModule,
  ],
})
export class AppModule {}
