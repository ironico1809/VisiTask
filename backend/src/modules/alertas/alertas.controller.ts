import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Headers,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AlertasService } from './alertas.service.js';
import { ConfigurarAlertasDto } from './dto/configurar-alertas.dto.js';
import { DispararAlertaDto, DescartarAlertaDto } from './dto/disparar-alerta.dto.js';

function extraerUsuarioIdDeCabecera(authHeader?: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return 'usr-manuela-root';
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.sub || json?.id || 'usr-manuela-root';
  } catch {
    return 'usr-manuela-root';
  }
}

function extraerOrganizacionIdDeCabecera(authHeader?: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return 'org-visitask-global';
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.organizationId || json?.organizacionId || 'org-visitask-global';
  } catch {
    return 'org-visitask-global';
  }
}

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get('configuracion')
  async obtenerConfiguracion(@Headers('authorization') authHeader?: string) {
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.alertasService.obtenerConfiguracion(organizacionId);
  }

  @Put('configuracion')
  @HttpCode(HttpStatus.OK)
  async actualizarConfiguracion(
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: ConfigurarAlertasDto,
  ) {
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.alertasService.actualizarConfiguracion(organizacionId, dto);
  }

  @Post('disparar')
  @HttpCode(HttpStatus.CREATED)
  async dispararAlerta(
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: DispararAlertaDto,
  ) {
    const usuarioId = extraerUsuarioIdDeCabecera(authHeader);
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.alertasService.dispararAlerta(usuarioId, organizacionId, dto);
  }

  @Get()
  async listarAlertas(
    @Headers('authorization') authHeader?: string,
    @Query('limite') limite?: string,
  ) {
    const usuarioId = extraerUsuarioIdDeCabecera(authHeader);
    const cant = limite ? parseInt(limite, 10) : 20;
    return this.alertasService.listarAlertas(usuarioId, cant);
  }

  @Put(':id/descartar')
  @HttpCode(HttpStatus.OK)
  async descartarAlerta(
    @Param('id') id: string,
    @Body() dto: DescartarAlertaDto,
  ) {
    return this.alertasService.descartarAlerta(id, dto.motivo);
  }

  @Post('probar-push')
  @HttpCode(HttpStatus.OK)
  async probarNotificacionPush(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { tokenDispositivo?: string },
  ) {
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.alertasService.probarNotificacionPush(organizacionId, body.tokenDispositivo);
  }
}
