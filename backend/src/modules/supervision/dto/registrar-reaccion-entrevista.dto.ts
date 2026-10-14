import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RegistrarReaccionEntrevistaDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  supervisionSessionId!: string;

  @IsNumber()
  reactionLatencyMs!: number;

  @IsNumber()
  facialTensionDelta!: number;

  @IsNumber()
  smileIncongruityScore!: number;

  @IsNumber()
  surpriseScore!: number;

  @IsNumber()
  cognitiveStressScore!: number;

  @IsOptional()
  @IsString()
  stimulusTimestamp?: string;
}
