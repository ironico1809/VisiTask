import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class DispararPreguntaControlDto {
  @IsOptional()
  @IsString()
  questionId?: string;

  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsString()
  supervisionSessionId?: string;

  @IsOptional()
  @IsNumber()
  duracionVentanaSegundos?: number = 15;
}

export class CrearPreguntaControlDto {
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @IsOptional()
  @IsString()
  assessmentId?: string;
}
