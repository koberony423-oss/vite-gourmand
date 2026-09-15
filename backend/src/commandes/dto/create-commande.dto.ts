import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCommandeDto {
  @IsUUID()
  menuId!: string;

  @IsInt()
  @Min(1)
  nbPersonnes!: number;

  @IsOptional()
  @IsUUID()
  adresseLivraisonId?: string;

  @IsOptional()
  distanceKm?: number;

  @IsDateString()
  datePrestation!: string;

  @IsString()
  heureSouhaitee!: string;
}
