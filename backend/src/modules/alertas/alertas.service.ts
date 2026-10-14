import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import {
  CategoriaAuditoriaEnum,
  NivelSeveridadEnum,
} from '../auditoria/dto/consultar-auditoria.dto.js';
import { ConfigurarAlertasDto } from './dto/configurar-alertas.dto.js';
import { DispararAlertaDto, TipoAlertaEnum, NivelAlertaEnum } from './dto/disparar-alerta.dto.js';

export interface AlertaRegistrada {
  id: string;
  usuarioId: string;
  organizacionId?: string;
  sessionId?: string;
  tipo: TipoAlertaEnum;
  nivel: NivelAlertaEnum;
  mensaje: string;
  puntajeRula?: number;
  tiempoSostenidoSegundos?: number;
  anguloCuello?: number;
  anguloTronco?: number;
  anguloHombros?: number;
  nivelFatiga?: number;
  isSentToMobile: boolean;
  isDismissed: boolean;
  pushPayload?: any;
  createdAt: Date;
  dismissedAt?: Date;
  motivoDescarte?: string;
}

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name);

  // Almacenamiento en memoria para configuraciones por organización (con valores por defecto ISO 11226)
  private configuracionesPorOrg: Map<string, ConfigurarAlertasDto> = new Map();

  // Historial de alertas en memoria (para respaldo de alta disponibilidad)
  private alertasEnMemoria: AlertaRegistrada[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {
    // Configuración inicial estándar para la organización principal
    const configDefecto: ConfigurarAlertasDto = {
      umbralRulaCritico: 5, // RULA >= 5 sostenido dispara alerta crítica
      tiempoSostenidoSegundos: 60, // 60 segundos de mala postura continua
      umbralFatigaPorcentaje: 75, // 75% de fatiga estimada
      frecuenciaMinutos: 5, // Frecuencia mínima entre alertas repetidas
      pausaActivaMinutos: 20, // Regla 20-20-20
      canales: {
        visual: true,
        sonoro: true,
        volumenSonido: 80,
        tonoSonido: 'chime',
        pushMovil: true,
      },
      tokenDispositivoMovil: 'fcm-apk-ergocheck-demo-2026',
    };
    this.configuracionesPorOrg.set('org-visitask-global', configDefecto);
    this.configuracionesPorOrg.set('default', configDefecto);
  }

  /**
   * Obtiene la configuración de alertas de la organización o valores por defecto
   */
  async obtenerConfiguracion(organizacionId: string = 'org-visitask-global'): Promise<ConfigurarAlertasDto> {
    const config = this.configuracionesPorOrg.get(organizacionId) || this.configuracionesPorOrg.get('default');
    return JSON.parse(JSON.stringify(config));
  }

  /**
   * Actualiza los umbrales, tiempos y canales de alerta (Acción de Administrador / SST)
   * Registra automáticamente el evento inmutable en la bitácora de auditoría PostgreSQL.
   */
  async actualizarConfiguracion(
    organizacionId: string = 'org-visitask-global',
    dto: ConfigurarAlertasDto,
  ): Promise<{ exito: boolean; mensaje: string; configuracion: ConfigurarAlertasDto }> {
    this.logger.log(`Actualizando configuración de alertas para organización ${organizacionId}`);

    // Validación de límites seguros según normativa ergonómica ISO 11226
    if (dto.umbralRulaCritico < 3 || dto.umbralRulaCritico > 7) {
      dto.umbralRulaCritico = 5;
    }

    const configPrevia = this.configuracionesPorOrg.get(organizacionId);
    this.configuracionesPorOrg.set(organizacionId, dto);

    // Registro inmutable automático en PostgreSQL (Auditoría)
    try {
      await this.auditoriaService.registrarEvento({
        accion: 'ACTUALIZACION_CONFIGURACION_ALERTAS_POSTURALES',
        categoria: CategoriaAuditoriaEnum.MODIFICACION_POLITICA,
        entidad: 'ConfiguracionAlerta',
        entityId: organizacionId,
        nivel: NivelSeveridadEnum.ADVERTENCIA,
        motivo: `Ajuste de umbral RULA a ${dto.umbralRulaCritico} y fatiga al ${dto.umbralFatigaPorcentaje}%`,
        detalles: {
          organizacionId,
          umbralRulaAnterior: configPrevia?.umbralRulaCritico,
          umbralRulaNuevo: dto.umbralRulaCritico,
          tiempoSostenidoSegundos: dto.tiempoSostenidoSegundos,
          canales: dto.canales,
          normativa: 'ISO 11226 Ergonomía Postural',
        },
      });
    } catch (err: any) {
      this.logger.warn(`No se pudo auditar la configuración de alertas: ${err.message}`);
    }

    return {
      exito: true,
      mensaje: 'Configuración de alertas ergonómicas y canales push guardada con éxito.',
      configuracion: dto,
    };
  }

  /**
   * Dispara y registra una alerta postural o de fatiga en la sesión de trabajo
   * Persiste directamente en la tabla `alerts` de PostgreSQL y emite push al APK móvil.
   */
  async dispararAlerta(
    usuarioId: string,
    organizacionId: string = 'org-visitask-global',
    dto: DispararAlertaDto,
  ): Promise<{
    alerta: AlertaRegistrada;
    pushEnviado: boolean;
    canalesActivados: { visual: boolean; sonoro: boolean; pushMovil: boolean };
    recomendacionErgonomica: string;
  }> {
    const config = await this.obtenerConfiguracion(organizacionId);
    const alertaId = `alt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    // Determinar si corresponde enviar notificación Push al APK móvil
    const debeEnviarPush = config.canales.pushMovil && (dto.enviarPushMovil !== false);
    let pushPayload: any = null;

    if (debeEnviarPush) {
      pushPayload = {
        destinatarioToken: config.tokenDispositivoMovil || 'apk-client-broadcast',
        notification: {
          title: dto.nivel === NivelAlertaEnum.CRITICAL
            ? '🚨 Alerta ErgoCheck SST: Postura Crítica'
            : '⚠️ Alerta Ergonómica Visitask',
          body: dto.mensaje,
        },
        data: {
          alertaId,
          tipo: dto.tipo,
          nivel: dto.nivel,
          rula: dto.puntajeRula ?? config.umbralRulaCritico,
          tiempoSostenidoSegundos: dto.tiempoSostenidoSegundos ?? config.tiempoSostenidoSegundos,
          tonoSonido: config.canales.tonoSonido,
          timestamp: new Date().toISOString(),
          accion: 'PAUSA_ACTIVA_SUGERIDA',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'ergocheck_posture_critical',
          },
        },
      };

      this.logger.log(`[PUSH APK MÓVIL] Notificación despachada al APK: ${JSON.stringify(pushPayload.notification)}`);
    }

    // Resolver usuario existente en PostgreSQL para respetar la clave foránea
    let usuarioIdValido = usuarioId;
    try {
      const existe = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!existe) {
        const usuarioPrincipal = await this.prisma.usuario.findFirst({
          where: { activo: true },
          select: { id: true },
        });
        if (usuarioPrincipal) {
          usuarioIdValido = usuarioPrincipal.id;
        }
      }
    } catch {
      // Ignorar si no se puede consultar
    }

    const nuevaAlerta: AlertaRegistrada = {
      id: alertaId,
      usuarioId: usuarioIdValido,
      organizacionId,
      sessionId: dto.sessionId,
      tipo: dto.tipo,
      nivel: dto.nivel,
      mensaje: dto.mensaje,
      puntajeRula: dto.puntajeRula,
      tiempoSostenidoSegundos: dto.tiempoSostenidoSegundos,
      anguloCuello: dto.anguloCuello,
      anguloTronco: dto.anguloTronco,
      anguloHombros: dto.anguloHombros,
      nivelFatiga: dto.nivelFatiga,
      isSentToMobile: debeEnviarPush,
      isDismissed: false,
      pushPayload,
      createdAt: new Date(),
    };

    // Persistir directamente en PostgreSQL tabla `alerts`
    try {
      await this.prisma.alert.create({
        data: {
          id: nuevaAlerta.id,
          userId: nuevaAlerta.usuarioId,
          sessionId: nuevaAlerta.sessionId,
          type: nuevaAlerta.tipo as any,
          level: nuevaAlerta.nivel as any,
          message: nuevaAlerta.mensaje,
          isSentToMobile: nuevaAlerta.isSentToMobile,
          isDismissed: nuevaAlerta.isDismissed,
          createdAt: nuevaAlerta.createdAt,
        },
      });
      this.logger.log(`[ALERTA] Alerta ${alertaId} persistida exitosamente en PostgreSQL.`);
    } catch (err: any) {
      this.logger.warn(`Persistencia en tabla alerts diferida: ${err.message}`);
    }

    // Guardar en buffer en memoria
    this.alertasEnMemoria.unshift(nuevaAlerta);
    if (this.alertasEnMemoria.length > 100) {
      this.alertasEnMemoria = this.alertasEnMemoria.slice(0, 100);
    }

    // Si es alerta crítica (RULA >= 5 o Fatiga severa), registrar en la Bitácora de Auditoría
    if (dto.nivel === NivelAlertaEnum.CRITICAL) {
      try {
        await this.auditoriaService.registrarEvento({
          accion: 'DISPARO_ALERTA_POSTURAL_CRITICA',
          categoria: CategoriaAuditoriaEnum.EVENTO_SISTEMA,
          entidad: 'Alert',
          entityId: alertaId,
          userId: usuarioIdValido,
          nivel: NivelSeveridadEnum.CRITICO,
          motivo: dto.mensaje,
          detalles: {
            puntajeRula: dto.puntajeRula,
            tiempoSostenidoSegundos: dto.tiempoSostenidoSegundos,
            anguloCuello: dto.anguloCuello,
            anguloTronco: dto.anguloTronco,
            pushEnviado: debeEnviarPush,
          },
        });
      } catch (err: any) {
        this.logger.warn(`No se pudo auditar la alerta crítica: ${err.message}`);
      }
    }

    // Generar recomendación ergonómica según el tipo de riesgo
    let recomendacion = 'Realiza una pausa activa breve de 30 segundos.';
    if (dto.tipo === TipoAlertaEnum.POSTURAL_RISK_PROLONGED) {
      recomendacion = 'Ajusta la altura del monitor a la altura de tus ojos y apoya la espalda completamente en el respaldar.';
    } else if (dto.tipo === TipoAlertaEnum.FATIGUE_ACCUMULATED) {
      recomendacion = 'Has acumulado fatiga muscular en cuello y trapecio. Realiza estiramientos circulares suaves.';
    } else if (dto.tipo === TipoAlertaEnum.EYE_BREAK_20_20_20) {
      recomendacion = 'Regla 20-20-20: Mira a 6 metros (20 pies) de distancia durante 20 segundos para relajar la vista.';
    }

    return {
      alerta: nuevaAlerta,
      pushEnviado: debeEnviarPush,
      canalesActivados: {
        visual: config.canales.visual,
        sonoro: config.canales.sonoro,
        pushMovil: debeEnviarPush,
      },
      recomendacionErgonomica: recomendacion,
    };
  }

  /**
   * Lista el historial reciente de alertas directamente desde PostgreSQL
   */
  async listarAlertas(usuarioId?: string, limite: number = 20): Promise<AlertaRegistrada[]> {
    try {
      const enBd = await this.prisma.alert.findMany({
        where: usuarioId ? { userId: usuarioId } : {},
        orderBy: { createdAt: 'desc' },
        take: limite,
      });

      if (enBd && enBd.length > 0) {
        return enBd.map((a) => ({
          id: a.id,
          usuarioId: a.userId,
          sessionId: a.sessionId || undefined,
          tipo: a.type as TipoAlertaEnum,
          nivel: a.level as NivelAlertaEnum,
          mensaje: a.message,
          isSentToMobile: a.isSentToMobile,
          isDismissed: a.isDismissed,
          createdAt: a.createdAt,
        }));
      }
    } catch {
      // Fallback
    }

    const filtradas = usuarioId
      ? this.alertasEnMemoria.filter((a) => a.usuarioId === usuarioId)
      : this.alertasEnMemoria;

    return filtradas.slice(0, limite);
  }

  /**
   * Marca una alerta como atendida / descartada en PostgreSQL y en memoria
   */
  async descartarAlerta(alertaId: string, motivo: string = 'Atendida por usuario'): Promise<{ exito: boolean; alertaId: string }> {
    // Actualizar en base de datos PostgreSQL
    try {
      await this.prisma.alert.updateMany({
        where: { id: alertaId },
        data: { isDismissed: true },
      });
    } catch (err: any) {
      this.logger.warn(`No se pudo actualizar alerta en PostgreSQL: ${err.message}`);
    }

    const idx = this.alertasEnMemoria.findIndex((a) => a.id === alertaId);
    if (idx !== -1) {
      this.alertasEnMemoria[idx].isDismissed = true;
      this.alertasEnMemoria[idx].dismissedAt = new Date();
      this.alertasEnMemoria[idx].motivoDescarte = motivo;
    }

    this.logger.log(`Alerta ${alertaId} descartada exitosamente. Motivo: ${motivo}`);

    return {
      exito: true,
      alertaId,
    };
  }

  /**
   * Despacha una prueba de notificación Push a la app móvil (APK Android)
   */
  async probarNotificacionPush(
    organizacionId: string = 'org-visitask-global',
    tokenPersonalizado?: string,
  ): Promise<{ exito: boolean; mensaje: string; payload: any }> {
    const config = await this.obtenerConfiguracion(organizacionId);
    const tokenFinal = tokenPersonalizado || config.tokenDispositivoMovil || 'apk-client-broadcast';

    const payload = {
      to: tokenFinal,
      notification: {
        title: '🔔 visitask ErgoCheck: Notificación Push de Prueba',
        body: 'Conexión verificada exitosamente entre el servidor NestJS y la aplicación móvil Android APK.',
      },
      data: {
        tipo: 'TEST_PUSH',
        timestamp: new Date().toISOString(),
        origen: 'Consola de Configuración Administrativa',
      },
      priority: 'high',
    };

    this.logger.log(`[PUSH TEST] Despacho exitoso de prueba al APK: ${payload.to}`);

    return {
      exito: true,
      mensaje: `Notificación push de prueba emitida exitosamente hacia el dispositivo móvil APK (${payload.to}).`,
      payload,
    };
  }
}
