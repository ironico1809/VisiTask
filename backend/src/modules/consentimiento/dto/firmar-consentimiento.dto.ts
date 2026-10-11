import { IsArray, IsOptional, IsString } from 'class-validator';

export class FirmarConsentimientoDto {
  @IsOptional()
  @IsArray()
  tipos?: string[]; // ['CAMERA_AND_BIOMETRICS', 'TELEMETRY_AND_ACTIVITY']

  @IsOptional()
  @IsString()
  version?: string; // '1.0'
}
