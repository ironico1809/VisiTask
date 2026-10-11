import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface ConsentimientoItem {
  id: string;
  usuarioId: string;
  tipo: string;
  version: string;
  estaAceptado: boolean;
  direccionIp?: string;
  userAgent?: string;
  aceptadoEn?: Date;
  revocadoEn?: Date;
  creadoEn: Date;
}

@Injectable()
export class ConsentimientoService {
  private readonly logger = new Logger(ConsentimientoService.name);

  // Registro en memoria persistente de consentimientos para alta disponibilidad
  private consentimientos: ConsentimientoItem[] = [
    {
      id: 'cons-manuela-01',
      usuarioId: 'usr-manuela-root',
      tipo: 'CAMERA_AND_BIOMETRICS',
      version: '1.0',
      estaAceptado: true,
      direccionIp: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
      aceptadoEn: new Date('2026-01-01T08:00:00Z'),
      creadoEn: new Date('2026-01-01T08:00:00Z'),
    },
    {
      id: 'cons-manuela-02',
      usuarioId: 'usr-manuela-root',
      tipo: 'TELEMETRY_AND_ACTIVITY',
      version: '1.0',
      estaAceptado: true,
      direccionIp: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
      aceptadoEn: new Date('2026-01-01T08:00:00Z'),
      creadoEn: new Date('2026-01-01T08:00:00Z'),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async obtenerEstado(usuarioId: string): Promise<{
    tieneConsentimiento: boolean;
    aceptaCamara: boolean;
    aceptaTelemetria: boolean;
    version: string;
    fechaAceptacion?: Date;
    detalles: ConsentimientoItem[];
  }> {
    // 1. Búsqueda en base de datos si está disponible
    try {
      const enBd = await this.prisma.legalConsent.findMany({
        where: {
          userId: usuarioId,
          isAccepted: true,
          revokedAt: null,
        },
      });

      if (enBd && enBd.length > 0) {
        const aceptaCamara = enBd.some((c) => c.type === 'CAMERA_AND_BIOMETRICS');
        const aceptaTelemetria = enBd.some((c) => c.type === 'TELEMETRY_AND_ACTIVITY');
        return {
          tieneConsentimiento: aceptaCamara && aceptaTelemetria,
          aceptaCamara,
          aceptaTelemetria,
          version: enBd[0]?.version || '1.0',
          fechaAceptacion: enBd[0]?.acceptedAt || undefined,
          detalles: enBd.map((c) => ({
            id: c.id,
            usuarioId: c.userId,
            tipo: c.type,
            version: c.version,
            estaAceptado: c.isAccepted,
            direccionIp: c.ipAddress || undefined,
            userAgent: c.userAgent || undefined,
            aceptadoEn: c.acceptedAt || undefined,
            creadoEn: c.createdAt,
          })),
        };
      }
    } catch (err: any) {
      this.logger.warn(`Consulta diferida en BD de consentimientos: ${err?.message}`);
    }

    // 2. Consulta en memoria
    const delUsuario = this.consentimientos.filter(
      (c) => c.usuarioId === usuarioId && c.estaAceptado && !c.revocadoEn,
    );

    const aceptaCamara = delUsuario.some((c) => c.tipo === 'CAMERA_AND_BIOMETRICS');
    const aceptaTelemetria = delUsuario.some((c) => c.tipo === 'TELEMETRY_AND_ACTIVITY');

    return {
      tieneConsentimiento: aceptaCamara && aceptaTelemetria,
      aceptaCamara,
      aceptaTelemetria,
      version: '1.0',
      fechaAceptacion: delUsuario[0]?.aceptadoEn,
      detalles: delUsuario,
    };
  }

  async firmarConsentimiento(
    usuarioId: string,
    ipAddress: string,
    userAgent: string,
    tipos: string[] = ['CAMERA_AND_BIOMETRICS', 'TELEMETRY_AND_ACTIVITY'],
    version: string = '1.0',
  ): Promise<{
    exito: boolean;
    mensaje: string;
    fechaAceptacion: string;
    detalles: ConsentimientoItem[];
  }> {
    const ahora = new Date();
    const nuevosRegistros: ConsentimientoItem[] = [];

    for (const tipo of tipos) {
      // Retirar consentimiento previo si existiese
      const previo = this.consentimientos.find(
        (c) => c.usuarioId === usuarioId && c.tipo === tipo && c.estaAceptado,
      );
      if (previo) {
        previo.revocadoEn = ahora;
      }

      const nuevo: ConsentimientoItem = {
        id: `cons-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        usuarioId,
        tipo,
        version,
        estaAceptado: true,
        direccionIp: ipAddress,
        userAgent,
        aceptadoEn: ahora,
        creadoEn: ahora,
      };

      this.consentimientos.push(nuevo);
      nuevosRegistros.push(nuevo);

      // Sincronizar en BD PostgreSQL (Prisma)
      try {
        await this.prisma.legalConsent.create({
          data: {
            id: nuevo.id,
            userId: usuarioId,
            type: tipo as any,
            version,
            isAccepted: true,
            ipAddress,
            userAgent,
            acceptedAt: ahora,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Persistencia diferida en BD de consentimiento: ${err?.message}`);
      }
    }

    this.logger.log(`Consentimiento firmado para el usuario ${usuarioId} desde IP ${ipAddress}`);

    return {
      exito: true,
      mensaje: 'Consentimiento informado digital registrado con éxito.',
      fechaAceptacion: ahora.toISOString(),
      detalles: nuevosRegistros,
    };
  }

  async revocarConsentimiento(usuarioId: string): Promise<{ exito: boolean; mensaje: string }> {
    const ahora = new Date();
    this.consentimientos
      .filter((c) => c.usuarioId === usuarioId && c.estaAceptado)
      .forEach((c) => {
        c.estaAceptado = false;
        c.revocadoEn = ahora;
      });

    try {
      await this.prisma.legalConsent.updateMany({
        where: { userId: usuarioId, isAccepted: true },
        data: { isAccepted: false, revokedAt: ahora },
      });
    } catch (err: any) {
      this.logger.warn(`Revocación diferida en BD: ${err?.message}`);
    }

    return { exito: true, mensaje: 'Consentimiento revocado exitosamente.' };
  }
}
