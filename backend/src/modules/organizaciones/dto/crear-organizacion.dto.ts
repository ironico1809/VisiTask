import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CrearOrganizacionDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la organización es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  identificacionFiscal?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  plan?: string;
}

export class ActualizarOrganizacionDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  identificacionFiscal?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  plan?: string;
}
