import { IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';

export class RegistrarPosturaDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsNumber()
  rulaScore!: number;

  @IsNumber()
  neckAngle!: number;

  @IsNumber()
  trunkAngle!: number;

  @IsNumber()
  shoulderAngle!: number;

  @IsOptional()
  @IsBoolean()
  isStatic?: boolean;

  @IsOptional()
  @IsNumber()
  staticSeconds?: number;
}

export class CalibrarPosturaDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsNumber()
  neutralNeckAngle!: number;

  @IsNumber()
  neutralTrunkAngle!: number;

  @IsNumber()
  neutralShoulderDist!: number;

  @IsOptional()
  @IsNumber()
  ambientLighting?: number;
}
