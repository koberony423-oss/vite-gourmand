import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PgService } from '../common/pg.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ForgotPasswordDto, ResetPasswordDto } from './dto/reset.dto.js';

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
  private readonly logger = new Logger(AuthService.name);

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

  /**
   * Réinitialisation de mot de passe — étape 1.
   * Génère un jeton aléatoire à usage unique (valable 1 h). Seul son
   * empreinte SHA-256 est stockée en base : une fuite de la table ne
   * permet pas de réutiliser les jetons. La réponse est identique que
   * l'email existe ou non (anti-énumération de comptes, RGPD).
   * En production le jeton serait envoyé par email (SMTP) ; ici il est
   * journalisé côté serveur et, en mode développement, renvoyé dans la
   * réponse pour permettre la démonstration devant le jury.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const message =
      'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.';
    const result = await this.pg.query<UtilisateurRow>(
      'select id, email from utilisateur where email = $1 and actif = true',
      [dto.email.toLowerCase()],
    );
    const user = result.rows[0];
    if (!user) return { message };

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.pg.query(
      `insert into reinitialisation_mot_de_passe (utilisateur_id, jeton_hash, expire_le)
       values ($1, $2, now() + interval '1 hour')`,
      [user.id, tokenHash],
    );
    this.logger.log(`Jeton de réinitialisation généré pour ${user.email}`);

    const devToken = process.env.NODE_ENV === 'production' ? undefined : token;
    return { message, ...(devToken ? { tokenDev: devToken } : {}) };
  }

  /** Réinitialisation — étape 2 : vérifie le jeton puis remplace le hash. */
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const result = await this.pg.query<{ id: string; utilisateur_id: string }>(
      `select id, utilisateur_id from reinitialisation_mot_de_passe
       where jeton_hash = $1 and utilise = false and expire_le > now()`,
      [tokenHash],
    );
    const row = result.rows[0];
    if (!row) throw new BadRequestException('Lien invalide ou expiré');

    const hash = await bcrypt.hash(dto.motDePasse, 10);
    await this.pg.query(
      'update utilisateur set mot_de_passe_hash = $1, updated_at = now() where id = $2',
      [hash, row.utilisateur_id],
    );
    await this.pg.query(
      'update reinitialisation_mot_de_passe set utilise = true where id = $1',
      [row.id],
    );
    return { message: 'Mot de passe modifié. Vous pouvez vous connecter.' };
  }

  private buildSession(user: UtilisateurRow) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: this.toPublicUser(user) };
  }
}
