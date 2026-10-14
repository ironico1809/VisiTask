import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export enum TipoAlertaEnum {
  POSTURAL_RISK_PROLONGED = 'POSTURAL_RISK_PROLONGED',
  STATIC_OVERLOAD = 'STATIC_OVERLOAD',
  FATIGUE_ACCUMULATED = 'FATIGUE_ACCUMULATED',
  EYE_BREAK_20_20_20 = 'EYE_BREAK_20_20_20',
  ANOMALY_BEHAVIOR = 'ANOMALY_BEHAVIOR',
}

export enum NivelAlertaEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class DispararAlertaDto {
  @IsEnum(TipoAlertaEnum)
  tipo: TipoAlertaEnum;

  @IsEnum(NivelAlertaEnum)
  nivel: NivelAlertaEnum;

  @IsString()
  mensaje: string;

  @IsOptional()
  @IsNumber()
  puntajeRula?: number;

  @IsOptional()
  @IsNumber()
  tiempoSostenidoSegundos?: number;

  @IsOptional()
  @IsNumber()
  anguloCuello?: number;

  @IsOptional()
  @IsNumber()
  anguloTronco?: number;

  @IsOptional()
  @IsNumber()
  anguloHombros?: number;

  @IsOptional()
  @IsNumber()
  nivelFatiga?: number;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsBoolean()
  enviarPushMovil?: boolean;
}

export class DescartarAlertaDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
