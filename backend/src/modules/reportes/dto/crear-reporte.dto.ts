import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum TipoReporteSst {
  ERGONOMIC_SST_CORPORATE = 'ERGONOMIC_SST_CORPORATE',
  FORENSIC_EXAM_INDIVIDUAL = 'FORENSIC_EXAM_INDIVIDUAL',
}

export class CrearReporteDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsEnum(TipoReporteSst)
  tipo!: TipoReporteSst;

  @IsOptional()
  @IsString()
  supervisionSessionId?: string;

  @IsOptional()
  metricasResumen?: Record<string, any>;
}
