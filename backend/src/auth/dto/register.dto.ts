import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  nom!: string;

  @IsString()
  @MinLength(1)
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse!: string;

  @IsOptional()
  @IsString()
  numeroGsm?: string;
}
