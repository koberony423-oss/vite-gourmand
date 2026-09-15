import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(1)
  nom!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsString()
  @MinLength(1)
  sujet!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
