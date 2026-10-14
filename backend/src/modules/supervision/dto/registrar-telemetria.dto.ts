import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class RegistrarTelemetriaDto {
  @IsOptional()
  @IsString()
  supervisionSessionId?: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // 'WINDOW_BLUR' | 'WINDOW_FOCUS' | 'FULLSCREEN_EXIT' | 'SHORTCUT_BLOCKED' | 'CLIPBOARD_PASTE_BLOCKED' | etc.

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  targetDomain?: string;

  @IsOptional()
  @IsBoolean()
  isForbiddenDomain?: boolean;
}
