import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ErgonomiaService, EstadisticasPanelErgonomico } from './ergonomia.service.js';
import { RegistrarPosturaDto, CalibrarPosturaDto } from './dto/registrar-postura.dto.js';

function extraerUsuarioDeCabecera(authHeader?: string): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.sub || json?.email;
  } catch {
    return undefined;
  }
}

@Controller('ergonomia')
export class ErgonomiaController {
  constructor(private readonly ergonomiaService: ErgonomiaService) {}

  @Get('estadisticas-panel')
  async obtenerEstadisticasPanel(): Promise<EstadisticasPanelErgonomico> {
    return this.ergonomiaService.obtenerEstadisticasPanel();
  }

  @Get('sesion-activa')
  async obtenerSesionActiva(@Headers('authorization') authHeader?: string) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.ergonomiaService.obtenerSesionActiva(usuarioId);
  }

  @Post('calibrar')
  @HttpCode(HttpStatus.OK)
  async calibrar(
    @Body() dto: CalibrarPosturaDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.ergonomiaService.calibrar(dto, usuarioId);
  }

  @Post('postura')
  @HttpCode(HttpStatus.OK)
  async registrarPostura(
    @Body() dto: RegistrarPosturaDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.ergonomiaService.registrarPostura(dto, usuarioId);
  }
}
