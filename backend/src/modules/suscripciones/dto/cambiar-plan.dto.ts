import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export enum TipoPlanSuscripcion {
  SAAS_SEAT_MONTHLY = 'SAAS_SEAT_MONTHLY',
  PAY_PER_EXAM_PACKAGE = 'PAY_PER_EXAM_PACKAGE',
  ENTERPRISE_CUSTOM = 'ENTERPRISE_CUSTOM',
}

export enum CicloFacturacion {
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

export class SimularCambioPlanDto {
  @IsEnum(TipoPlanSuscripcion)
  planType!: TipoPlanSuscripcion;

  @IsOptional()
  @IsNumber()
  @Min(1)
  seatsAllocated?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  examsAllocated?: number;

  @IsOptional()
  @IsEnum(CicloFacturacion)
  billingCycle?: CicloFacturacion;
}

export class CambiarPlanDto extends SimularCambioPlanDto {
  @IsOptional()
  @IsBoolean()
  immediateEffect?: boolean;
}
