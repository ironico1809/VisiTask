import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RegistrarMiradaDto {
  @IsOptional()
  @IsString()
  supervisionSessionId?: string;

  @IsNumber()
  pitch!: number;

  @IsNumber()
  yaw!: number;

  @IsNumber()
  roll!: number;

  @IsNumber()
  irisOffsetX!: number;

  @IsNumber()
  irisOffsetY!: number;

  @IsOptional()
  @IsBoolean()
  isSuspectedLapPhone?: boolean;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}
