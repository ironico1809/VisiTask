import { Controller, Get, Post, Body, Headers, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ConsentimientoService } from './consentimiento.service.js';
import { FirmarConsentimientoDto } from './dto/firmar-consentimiento.dto.js';

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

@Controller('consentimiento')
export class ConsentimientoController {
  constructor(private readonly consentimientoService: ConsentimientoService) {}

  @Get('estado')
  async obtenerEstado(@Headers('authorization') authHeader?: string) {
    const usuarioId = extraerUsuarioIdDeCabecera(authHeader);
    return this.consentimientoService.obtenerEstado(usuarioId);
  }

  @Post('firmar')
  async firmar(
    @Req() req: Request,
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: FirmarConsentimientoDto,
  ) {
    const usuarioId = extraerUsuarioIdDeCabecera(authHeader);
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Navegador Web';

    const tipos = dto.tipos && dto.tipos.length > 0
      ? dto.tipos
      : ['CAMERA_AND_BIOMETRICS', 'TELEMETRY_AND_ACTIVITY'];

    const version = dto.version || '1.0';

    return this.consentimientoService.firmarConsentimiento(
      usuarioId,
      ipAddress,
      userAgent,
      tipos,
      version,
    );
  }

  @Post('revocar')
  async revocar(@Headers('authorization') authHeader?: string) {
    const usuarioId = extraerUsuarioIdDeCabecera(authHeader);
    return this.consentimientoService.revocarConsentimiento(usuarioId);
  }
}
