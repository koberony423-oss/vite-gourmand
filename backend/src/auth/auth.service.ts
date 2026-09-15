import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PgService } from '../common/pg.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';

interface UtilisateurRow {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  numero_gsm: string | null;
  mot_de_passe_hash: string;
  role: 'utilisateur' | 'employe' | 'administrateur';
  actif: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly pg: PgService,
    private readonly jwt: JwtService,
  ) {}

  private toPublicUser(row: UtilisateurRow) {
    return {
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      numeroGsm: row.numero_gsm,
      role: row.role,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.pg.query<UtilisateurRow>(
      'select id from utilisateur where email = $1',
      [dto.email.toLowerCase()],
    );
    if (existing.rowCount) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const hash = await bcrypt.hash(dto.motDePasse, 10);
    const result = await this.pg.query<UtilisateurRow>(
      `insert into utilisateur (nom, prenom, email, numero_gsm, mot_de_passe_hash, role)
       values ($1, $2, $3, $4, $5, 'utilisateur')
       returning *`,
      [dto.nom, dto.prenom, dto.email.toLowerCase(), dto.numeroGsm ?? null, hash],
    );
    const user = result.rows[0];
    return this.buildSession(user);
  }

  async login(dto: LoginDto) {
    const result = await this.pg.query<UtilisateurRow>(
      'select * from utilisateur where email = $1 and actif = true',
      [dto.email.toLowerCase()],
    );
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.motDePasse, user.mot_de_passe_hash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.buildSession(user);
  }

  async me(userId: string) {
    const result = await this.pg.query<UtilisateurRow>(
      'select * from utilisateur where id = $1',
      [userId],
    );
    if (!result.rowCount) throw new UnauthorizedException();
    return this.toPublicUser(result.rows[0]);
  }

  private buildSession(user: UtilisateurRow) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: this.toPublicUser(user) };
  }
}
