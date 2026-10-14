import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum EstadoIncidenteAuditoria {
  FLAGGED_AUTOMATIC = 'FLAGGED_AUTOMATIC',
  CONFIRMED_VIOLATION = 'CONFIRMED_VIOLATION',
  DISMISSED_FALSE_POSITIVE = 'DISMISSED_FALSE_POSITIVE',
}

export class AuditarIncidenteDto {
  @IsEnum(EstadoIncidenteAuditoria)
  @IsNotEmpty()
  estado!: EstadoIncidenteAuditoria;

  @IsString()
  @IsNotEmpty()
  justificacion!: string;

  @IsOptional()
  @IsString()
  notasEvaluador?: string;
}
