import { IsNumber, IsBoolean, IsOptional, IsString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CanalesNotificacionDto {
  @IsBoolean()
  visual: boolean = true;

  @IsBoolean()
  sonoro: boolean = true;

  @IsNumber()
  @Min(0)
  @Max(100)
  volumenSonido: number = 80;

  @IsString()
  tonoSonido: string = 'chime'; // 'chime' | 'alerta' | 'campana' | 'pulso'

  @IsBoolean()
  pushMovil: boolean = true;
}

export class ConfigurarAlertasDto {
  @IsNumber()
  @Min(3)
  @Max(7)
  umbralRulaCritico: number = 5;

  @IsNumber()
  @Min(10)
  @Max(600)
  tiempoSostenidoSegundos: number = 60;

  @IsNumber()
  @Min(40)
  @Max(100)
  umbralFatigaPorcentaje: number = 75;

  @IsNumber()
  @Min(1)
  @Max(60)
  frecuenciaMinutos: number = 5;

  @IsNumber()
  @Min(10)
  @Max(120)
  pausaActivaMinutos: number = 20;

  @ValidateNested()
  @Type(() => CanalesNotificacionDto)
  canales: CanalesNotificacionDto = new CanalesNotificacionDto();

  @IsOptional()
  @IsString()
  tokenDispositivoMovil?: string;
}
