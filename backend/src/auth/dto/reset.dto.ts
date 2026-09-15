import { IsEmail, IsString, MinLength } from 'class-validator';

/** Étape 1 : demande d'un lien de réinitialisation. */
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

/** Étape 2 : définition du nouveau mot de passe à partir du jeton reçu. */
export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse!: string;
}
