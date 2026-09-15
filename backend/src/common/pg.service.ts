import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, type QueryResultRow } from 'pg';

/**
 * Wrapper léger autour de `pg.Pool` pour interroger la base
 * relationnelle Supabase (PostgreSQL) via SQL brut.
 *
 * Choix d'architecture : pas d'ORM (Prisma/TypeORM) pour rester
 * proche du SQL, faciliter la relecture du schéma par le jury et
 * garder un contrôle explicite sur les requêtes (jointures, enum,
 * transactions) plutôt que de dépendre d'une couche de mapping.
 */
@Injectable()
export class PgService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
    return this.pool.query<T>(text, params as unknown[]);
  }

  async withTransaction<T>(fn: (client: Pool) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client as unknown as Pool);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
