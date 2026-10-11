import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum TipoMetodoPago {
  TARJETA = 'TARJETA',
  QR_BANCARIO = 'QR_BANCARIO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export class DatosTarjetaDto {
  @IsOptional()
  @IsString()
  numeroTarjeta?: string;

  @IsOptional()
  @IsString()
  expiracion?: string;

  @IsOptional()
  @IsString()
  cvc?: string;

  @IsOptional()
  @IsString()
  titular?: string;
}

export class ProcesarPagoDto {
  @IsString({ message: 'El ID de suscripción es requerido' })
  @IsNotEmpty()
  subscriptionId: string;

  @IsNumber({}, { message: 'El monto a cobrar debe ser un valor numérico' })
  monto: number;

  @IsEnum(TipoMetodoPago, { message: 'Tipo de método de pago no admitido' })
  tipoMetodoPago: TipoMetodoPago;

  @IsOptional()
  datosTarjeta?: DatosTarjetaDto;

  @IsOptional()
  @IsString()
  nitFiscal?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsBoolean()
  simularFallo?: boolean;
}

export class ReintentarCobroDto {
  @IsString({ message: 'El número de factura o ID es requerido' })
  @IsNotEmpty()
  invoiceNumber: string;

  @IsOptional()
  @IsBoolean()
  forzarExito?: boolean;
}
