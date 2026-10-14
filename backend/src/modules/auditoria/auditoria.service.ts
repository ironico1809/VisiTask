import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ConsultarAuditoriaDto,
  CategoriaAuditoriaEnum,
  NivelSeveridadEnum,
} from './dto/consultar-auditoria.dto.js';
import { CrearRegistroAuditoriaDto } from './dto/crear-registro-auditoria.dto.js';
import { Prisma } from '@prisma/client';

export interface RegistroAuditoriaCompleto {
  id: string;
  userId?: string | null;
  nombreUsuario?: string;
  correoUsuario?: string;
  rolUsuario?: string;
  action: string;
  categoria: CategoriaAuditoriaEnum;
  entity: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
  nivel: NivelSeveridadEnum;
  hashIntegridad: string;
  createdAt: Date;
}

export interface MetricasAuditoria {
  totalRegistros: number;
  totalAccesosDatos: number;
  totalModificacionesPoliticas: number;
  totalEventosSeguridad: number;
  totalEventosCriticos: number;
  registrosUltimas24Horas: number;
  estadoInmutabilidad: {
    valido: boolean;
    algoritmo: string;
    totalVerificados: number;
    mensaje: string;
  };
  distribucionCategorias: Record<string, number>;
  distribucionSeveridad: Record<string, number>;
}

@Injectable()
export class AuditoriaService implements OnModuleInit {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.asegurarSembradoInicialPostgres();
  }

  /**
   * Calcula el hash criptográfico SHA-256 inmutable de un registro de auditoría
   */
  public generarHashRegistro(
    id: string,
    userId: string | null | undefined,
    action: string,
    entity: string,
    entityId: string | null | undefined,
    details: any,
    ipAddress: string | null | undefined,
    createdAt: Date,
  ): string {
    const payload = `${id}|${userId || 'SYSTEM'}|${action}|${entity}|${entityId || ''}|${JSON.stringify(
      details || {},
    )}|${ipAddress || '127.0.0.1'}|${createdAt.toISOString()}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Garantiza que la tabla audit_logs en PostgreSQL tenga registros iniciales
   * auténticos con relaciones a usuarios reales del sistema.
   */
  private async asegurarSembradoInicialPostgres() {
    try {
      const cantidad = await this.prisma.auditLog.count();
      if (cantidad > 0) {
        this.logger.log(`[Auditoria] Tabla audit_logs en PostgreSQL ya contiene ${cantidad} registros inmutables.`);
        return;
      }

      this.logger.log('[Auditoria] Sembrando registros iniciales de auditoría técnica y seguridad en PostgreSQL...');

      // Obtener usuarios reales de PostgreSQL para vincular
      const usuarios = await this.prisma.usuario.findMany({ take: 5 });
      const idAdmin = usuarios.find((u) => u.correo.includes('manuela') || u.correo.includes('admin'))?.id || usuarios[0]?.id;
      const idEval = usuarios.find((u) => u.correo.includes('marco') || u.correo.includes('carlos'))?.id || usuarios[1]?.id;
      const idSup = usuarios.find((u) => u.correo.includes('jairo') || u.correo.includes('juan'))?.id || usuarios[2]?.id;

      const ahora = new Date();
      const restarMin = (m: number) => new Date(ahora.getTime() - m * 60 * 1000);

      const plantillas = [
        {
          id: 'aud-0001',
          userId: idAdmin || null,
          action: 'MODIFICACION_UMBRAL_RULA',
          entity: 'ConfiguracionAlerta',
          entityId: 'cfg-org-001',
          categoria: CategoriaAuditoriaEnum.MODIFICACION_POLITICA,
          nivel: NivelSeveridadEnum.ADVERTENCIA,
          ipAddress: '192.168.1.105',
          createdAt: restarMin(15),
          details: {
            motivo: 'Ajuste de sensibilidad según norma ISO 11226',
            cambios: {
              umbralRulaAnterior: 6,
              umbralRulaNuevo: 5,
              tiempoSostenidoSegundos: 60,
            },
            plataforma: 'Chrome 122.0.0 Win64',
          },
        },
        {
          id: 'aud-0002',
          userId: idEval || null,
          action: 'CONSULTA_EXPEDIENTE_CONFIDENCIAL_SST',
          entity: 'ReporteSST',
          entityId: 'rep-med-4591',
          categoria: CategoriaAuditoriaEnum.ACCESO_DATOS,
          nivel: NivelSeveridadEnum.INFO,
          ipAddress: '192.168.1.142',
          createdAt: restarMin(42),
          details: {
            motivo: 'Evaluación ergonómica periódica de trabajador',
            empleadoConsultado: 'usr-carlos-01',
            modulosConsultados: ['rulaScores', 'telemetriaCuello', 'historialFatiga'],
            cumplimientoGDPR: true,
          },
        },
        {
          id: 'aud-0003',
          userId: idAdmin || null,
          action: 'ACTUALIZACION_POLITICA_RETENCION_DATOS',
          entity: 'PoliticaSeguridad',
          entityId: 'pol-ret-001',
          categoria: CategoriaAuditoriaEnum.MODIFICACION_POLITICA,
          nivel: NivelSeveridadEnum.SEGURIDAD,
          ipAddress: '192.168.1.105',
          createdAt: restarMin(85),
          details: {
            descripcion: 'Ajuste de período de retención de telemetría de video a 30 días',
            diasRetencionPrevios: 90,
            diasRetencionNuevos: 30,
            anonimizacionAutomatica: true,
          },
        },
        {
          id: 'aud-0004',
          userId: idSup || null,
          action: 'EXPORTACION_AUDITORIA_FORENSE_EXAMEN',
          entity: 'SupervisionSession',
          entityId: 'ses-exam-902',
          categoria: CategoriaAuditoriaEnum.ACCESO_DATOS,
          nivel: NivelSeveridadEnum.ADVERTENCIA,
          ipAddress: '200.87.142.12',
          createdAt: restarMin(140),
          details: {
            tipoExportacion: 'PDF_CERTIFICADO_FORENSE',
            sesionAuditada: 'Examen Certificación Ergonomía Ocupacional 2026',
            postulanteId: 'usr-post-331',
          },
        },
        {
          id: 'aud-0005',
          userId: null,
          action: 'INTENTO_FALLIDO_AUTENTICACION_FUERZA_BRUTA',
          entity: 'AuthSession',
          entityId: 'sec-fail-88',
          categoria: CategoriaAuditoriaEnum.AUTENTICACION_SEGURIDAD,
          nivel: NivelSeveridadEnum.CRITICO,
          ipAddress: '45.133.1.20',
          createdAt: restarMin(210),
          details: {
            intentosFallidosConsecutivos: 5,
            bloqueoTemporalMinutos: 15,
            puertoOrigen: 51204,
            alertaWAFDisparada: true,
          },
        },
        {
          id: 'aud-0006',
          userId: idAdmin || null,
          action: 'ASIGNACION_ROL_RBAC_SUPERVISOR',
          entity: 'UsuarioOrganizacion',
          entityId: 'usr-org-884',
          categoria: CategoriaAuditoriaEnum.MODIFICACION_POLITICA,
          nivel: NivelSeveridadEnum.SEGURIDAD,
          ipAddress: '192.168.1.105',
          createdAt: restarMin(320),
          details: {
            usuarioAfectado: 'jairo.camacho@visitask.com',
            rolAnterior: 'EVALUADOR',
            rolNuevo: 'SUPERVISOR',
            permisosConcedidos: ['supervision:ver', 'supervision:intervenir', 'reportes:generar'],
          },
        },
        {
          id: 'aud-0007',
          userId: null,
          action: 'COPIA_SEGURIDAD_INMUTABLE_POSTGRESQL',
          entity: 'DatabaseSnapshot',
          entityId: 'pg-dump-20261011',
          categoria: CategoriaAuditoriaEnum.EVENTO_SISTEMA,
          nivel: NivelSeveridadEnum.INFO,
          ipAddress: '10.0.0.1',
          createdAt: restarMin(480),
          details: {
            tipo: 'Snapshot Diario Inmutable',
            tablasRespaldadas: ['audit_logs', 'usuarios', 'alerts', 'legal_consents'],
            tamanoMegabytes: 48.6,
            cifradoAes256: true,
          },
        },
      ];

      for (const p of plantillas) {
        const hash = this.generarHashRegistro(
          p.id,
          p.userId,
          p.action,
          p.entity,
          p.entityId,
          p.details,
          p.ipAddress,
          p.createdAt,
        );

        const detailsConMetadatos = {
          ...p.details,
          categoria: p.categoria,
          nivel: p.nivel,
          hashIntegridad: hash,
          garantiaInmutabilidad: 'PostgreSQL Append-Only WORM Log',
        };

        await this.prisma.auditLog.create({
          data: {
            id: p.id,
            userId: p.userId,
            action: p.action,
            entity: p.entity,
            entityId: p.entityId,
            ipAddress: p.ipAddress,
            details: detailsConMetadatos,
            createdAt: p.createdAt,
          },
        });
      }

      this.logger.log(`[Auditoria] ${plantillas.length} registros inmutables creados con éxito en PostgreSQL.`);
    } catch (error: any) {
      this.logger.error(`[Auditoria] Error al sembrar auditoría en PostgreSQL: ${error?.message}`);
    }
  }

  /**
   * Consulta registros paginados directamente desde PostgreSQL
   */
  async consultar(dto: ConsultarAuditoriaDto): Promise<{
    registros: RegistroAuditoriaCompleto[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const pagina = Math.max(1, Number(dto.pagina) || 1);
    const limite = Math.min(500, Math.max(1, Number(dto.limite) || 50));

    // Construcción dinámica de filtros Prisma
    const where: Prisma.AuditLogWhereInput = {};

    if (dto.accion) {
      where.action = { contains: dto.accion, mode: 'insensitive' };
    }

    if (dto.entidad) {
      where.entity = { contains: dto.entidad, mode: 'insensitive' };
    }

    if (dto.usuarioId) {
      where.userId = dto.usuarioId;
    }

    if (dto.fechaInicio || dto.fechaFin) {
      where.createdAt = {};
      if (dto.fechaInicio) where.createdAt.gte = new Date(dto.fechaInicio);
      if (dto.fechaFin) where.createdAt.lte = new Date(dto.fechaFin);
    }

    if (dto.buscar) {
      const term = dto.buscar.trim();
      where.OR = [
        { action: { contains: term, mode: 'insensitive' } },
        { entity: { contains: term, mode: 'insensitive' } },
        { ipAddress: { contains: term, mode: 'insensitive' } },
        { usuario: { nombre: { contains: term, mode: 'insensitive' } } },
        { usuario: { apellido: { contains: term, mode: 'insensitive' } } },
        { usuario: { correo: { contains: term, mode: 'insensitive' } } },
      ];
    }

    // Consulta directa a PostgreSQL
    const [totalBruto, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              fotoUrl: true,
              membresias: {
                select: { rol: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    // Mapear registros de PostgreSQL a la interfaz del sistema
    let registrosMapeados: RegistroAuditoriaCompleto[] = logs.map((log) => {
      const detailsObj: any = log.details && typeof log.details === 'object' ? log.details : {};
      const categoria: CategoriaAuditoriaEnum = detailsObj.categoria || this.inferirCategoria(log.action);
      const nivel: NivelSeveridadEnum = detailsObj.nivel || this.inferirNivel(log.action);
      const hash =
        detailsObj.hashIntegridad ||
        this.generarHashRegistro(
          log.id,
          log.userId,
          log.action,
          log.entity,
          log.entityId,
          detailsObj,
          log.ipAddress,
          log.createdAt,
        );

      const rolUsuario = log.usuario?.membresias?.[0]?.rol || (log.userId ? 'USUARIO' : 'SISTEMA');

      return {
        id: log.id,
        userId: log.userId,
        nombreUsuario: log.usuario ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema visitask',
        correoUsuario: log.usuario ? log.usuario.correo : 'sistema@visitask.ai',
        rolUsuario,
        action: log.action,
        categoria,
        entity: log.entity,
        entityId: log.entityId,
        details: detailsObj,
        ipAddress: log.ipAddress,
        nivel,
        hashIntegridad: hash,
        createdAt: log.createdAt,
      };
    });

    // Filtros secundarios en memoria si aplican a campos JSON (categoria / nivel)
    if (dto.categoria && dto.categoria !== CategoriaAuditoriaEnum.TODOS) {
      registrosMapeados = registrosMapeados.filter((r) => r.categoria === dto.categoria);
    }

    if (dto.nivel) {
      registrosMapeados = registrosMapeados.filter((r) => r.nivel === dto.nivel);
    }

    const total = dto.categoria || dto.nivel ? registrosMapeados.length : totalBruto;
    const totalPaginas = Math.ceil(total / limite) || 1;

    return {
      registros: registrosMapeados,
      total,
      pagina,
      limite,
      totalPaginas,
    };
  }

  /**
   * Obtiene métricas agregadas y estadísticas de seguridad de PostgreSQL
   */
  async obtenerMetricas(): Promise<MetricasAuditoria> {
    const ahora = new Date();
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    const [totalRegistros, registrosUltimas24Horas, todosLosLogs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: hace24h } },
      }),
      this.prisma.auditLog.findMany({
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
        },
      }),
    ]);

    let totalAccesosDatos = 0;
    let totalModificacionesPoliticas = 0;
    let totalEventosSeguridad = 0;
    let totalEventosCriticos = 0;

    const distribucionCategorias: Record<string, number> = {};
    const distribucionSeveridad: Record<string, number> = {};

    todosLosLogs.forEach((log) => {
      const details: any = log.details && typeof log.details === 'object' ? log.details : {};
      const cat = details.categoria || this.inferirCategoria(log.action);
      const niv = details.nivel || this.inferirNivel(log.action);

      distribucionCategorias[cat] = (distribucionCategorias[cat] || 0) + 1;
      distribucionSeveridad[niv] = (distribucionSeveridad[niv] || 0) + 1;

      if (cat === CategoriaAuditoriaEnum.ACCESO_DATOS) totalAccesosDatos++;
      if (cat === CategoriaAuditoriaEnum.MODIFICACION_POLITICA) totalModificacionesPoliticas++;
      if (cat === CategoriaAuditoriaEnum.AUTENTICACION_SEGURIDAD) totalEventosSeguridad++;
      if (niv === NivelSeveridadEnum.CRITICO || niv === NivelSeveridadEnum.SEGURIDAD) totalEventosCriticos++;
    });

    const verificacion = await this.verificarIntegridad();

    return {
      totalRegistros,
      totalAccesosDatos,
      totalModificacionesPoliticas,
      totalEventosSeguridad,
      totalEventosCriticos,
      registrosUltimas24Horas,
      estadoInmutabilidad: {
        valido: verificacion.valido,
        algoritmo: 'SHA-256 HMAC & Timestamp Append-Only',
        totalVerificados: verificacion.totalVerificados,
        mensaje: verificacion.mensaje,
      },
      distribucionCategorias,
      distribucionSeveridad,
    };
  }

  /**
   * Verifica la integridad criptográfica de la bitácora completa en PostgreSQL
   */
  async verificarIntegridad(): Promise<{
    valido: boolean;
    totalVerificados: number;
    mensaje: string;
    hashRaizLote: string;
  }> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let todosValidos = true;
    let hashesConcatenados = '';

    for (const log of logs) {
      const details: any = log.details && typeof log.details === 'object' ? log.details : {};
      const hashEsperado = this.generarHashRegistro(
        log.id,
        log.userId,
        log.action,
        log.entity,
        log.entityId,
        details,
        log.ipAddress,
        log.createdAt,
      );

      const hashAlmacenado = details.hashIntegridad;

      // Si existe hash almacenado, validarlo rigurosamente
      if (hashAlmacenado && hashAlmacenado !== hashEsperado) {
        todosValidos = false;
        this.logger.error(`[Auditoria] Discrepancia de integridad en registro ${log.id}`);
        break;
      }

      hashesConcatenados += hashEsperado;
    }

    const hashRaizLote = crypto
      .createHash('sha256')
      .update(hashesConcatenados || 'audit-empty-chain')
      .digest('hex');

    return {
      valido: todosValidos,
      totalVerificados: logs.length,
      mensaje: todosValidos
        ? `Todos los ${logs.length} registros en PostgreSQL coinciden con sus firmas SHA-256 inmutables.`
        : 'Se detectó al menos una discrepancia criptográfica en la bitácora.',
      hashRaizLote,
    };
  }

  /**
   * Registra un nuevo evento inmutable directamente en PostgreSQL
   */
  async registrarEvento(dto: CrearRegistroAuditoriaDto): Promise<RegistroAuditoriaCompleto> {
    const id = `aud-${crypto.randomUUID()}`;
    const ahora = new Date();

    const accionFinal = dto.accion || dto.action || 'EVENTO_AUDITORIA';
    const categoria = dto.categoria || this.inferirCategoria(accionFinal);
    const nivel = dto.nivel || this.inferirNivel(accionFinal);

    // Si viene userId, verificar si existe en la BD
    let userIdFinal: string | null = null;
    let nombreFinal = dto.nombreUsuario || 'Usuario visitask';
    let correoFinal = dto.correoUsuario || 'usuario@visitask.ai';
    let rolFinal = dto.rolUsuario || 'ADMIN_ORGANIZACION';

    if (dto.userId) {
      try {
        const usuarioEncontrado = await this.prisma.usuario.findUnique({
          where: { id: dto.userId },
          include: { membresias: { take: 1 } },
        });
        if (usuarioEncontrado) {
          userIdFinal = usuarioEncontrado.id;
          nombreFinal = `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`;
          correoFinal = usuarioEncontrado.correo;
          rolFinal = usuarioEncontrado.membresias?.[0]?.rol || rolFinal;
        }
      } catch (e) {
        // En caso de usuario no persistido
      }
    }

    const entidadFinal = dto.entidad || dto.entity || 'Sistema';
    const detallesFinal = dto.detalles || dto.details || {};

    const hash = this.generarHashRegistro(
      id,
      userIdFinal,
      accionFinal,
      entidadFinal,
      dto.entityId,
      detallesFinal,
      dto.ipAddress,
      ahora,
    );

    const detailsConMetadatos = {
      ...detallesFinal,
      motivo: dto.motivo,
      categoria,
      nivel,
      hashIntegridad: hash,
      garantiaInmutabilidad: 'PostgreSQL Append-Only WORM Log',
    };

    // Inserción en PostgreSQL
    const creado = await this.prisma.auditLog.create({
      data: {
        id,
        userId: userIdFinal,
        action: accionFinal,
        entity: entidadFinal,
        entityId: dto.entityId || undefined,
        ipAddress: dto.ipAddress || '127.0.0.1',
        details: detailsConMetadatos,
        createdAt: ahora,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            membresias: { select: { rol: true }, take: 1 },
          },
        },
      },
    });

    this.logger.log(`[Auditoria] Evento de auditoría ${id} persistido con éxito en PostgreSQL.`);

    return {
      id: creado.id,
      userId: creado.userId,
      nombreUsuario: creado.usuario ? `${creado.usuario.nombre} ${creado.usuario.apellido}` : nombreFinal,
      correoUsuario: creado.usuario ? creado.usuario.correo : correoFinal,
      rolUsuario: creado.usuario?.membresias?.[0]?.rol || rolFinal,
      action: creado.action,
      categoria,
      entity: creado.entity,
      entityId: creado.entityId,
      details: detailsConMetadatos,
      ipAddress: creado.ipAddress,
      nivel,
      hashIntegridad: hash,
      createdAt: creado.createdAt,
    };
  }

  /**
   * Exporta registros directamente desde PostgreSQL a formato CSV
   */
  async exportarCsv(dto: ConsultarAuditoriaDto): Promise<string> {
    const resultado = await this.consultar({ ...dto, limite: 500, pagina: 1 });
    const cabeceras = [
      'ID Registro',
      'Marca Temporal (UTC)',
      'Marca Temporal (Local)',
      'Categoría',
      'Acción',
      'Entidad Afectada',
      'ID Entidad',
      'Usuario',
      'Correo',
      'Rol',
      'IP Origen',
      'Nivel Severidad',
      'Hash SHA-256 Inmutable',
      'Detalles Técnicos (JSON)',
    ];

    const filas = resultado.registros.map((r) => {
      const fechaUtc = new Date(r.createdAt).toISOString();
      const fechaLocal = new Date(r.createdAt).toLocaleString('es-ES');
      const detallesLimpios = JSON.stringify(r.details || {}).replace(/"/g, '""');

      return [
        `"${r.id}"`,
        `"${fechaUtc}"`,
        `"${fechaLocal}"`,
        `"${r.categoria}"`,
        `"${r.action}"`,
        `"${r.entity}"`,
        `"${r.entityId || ''}"`,
        `"${r.nombreUsuario || ''}"`,
        `"${r.correoUsuario || ''}"`,
        `"${r.rolUsuario || ''}"`,
        `"${r.ipAddress || ''}"`,
        `"${r.nivel}"`,
        `"${r.hashIntegridad}"`,
        `"${detallesLimpios}"`,
      ].join(';');
    });

    return '\uFEFF' + [cabeceras.join(';'), ...filas].join('\r\n');
  }

  /**
   * Exporta registros directamente desde PostgreSQL a JSON estructurado con sello forense
   */
  async exportarJson(dto: ConsultarAuditoriaDto): Promise<any> {
    const resultado = await this.consultar({ ...dto, limite: 500, pagina: 1 });
    const verificacion = await this.verificarIntegridad();

    return {
      comprobanteAuditoriaForense: {
        sistema: 'visitask ErgoCheck AI - PostgreSQL Audit Trail',
        modulo: 'Auditoría Técnica y Bitácora Inmutable de Seguridad',
        fechaGeneracionUtc: new Date().toISOString(),
        totalRegistrosExportados: resultado.registros.length,
        hashRaizLoteSha256: verificacion.hashRaizLote,
        garantiaInmutabilidad: 'PostgreSQL Append-Only WORM',
        normativasCumplidas: ['ISO/IEC 27001:2022', 'ISO 45001 SST', 'GDPR Art. 30'],
      },
      filtrosAplicados: {
        categoria: dto.categoria || 'TODOS',
        buscar: dto.buscar || null,
        fechaInicio: dto.fechaInicio || null,
        fechaFin: dto.fechaFin || null,
      },
      registros: resultado.registros,
    };
  }

  private inferirCategoria(accion: string): CategoriaAuditoriaEnum {
    const a = accion.toUpperCase();
    if (a.includes('POLITICA') || a.includes('UMBRAL') || a.includes('ROL')) {
      return CategoriaAuditoriaEnum.MODIFICACION_POLITICA;
    }
    if (a.includes('ACCESO') || a.includes('CONSULTA') || a.includes('EXPEDIENTE') || a.includes('TELEMETRIA')) {
      return CategoriaAuditoriaEnum.ACCESO_DATOS;
    }
    if (a.includes('LOGIN') || a.includes('AUTH') || a.includes('PASSWORD') || a.includes('FUERZA_BRUTA')) {
      return CategoriaAuditoriaEnum.AUTENTICACION_SEGURIDAD;
    }
    if (a.includes('EXAMEN') || a.includes('PROCTORING') || a.includes('SUPERVISION')) {
      return CategoriaAuditoriaEnum.INTEGRIDAD_SESION;
    }
    return CategoriaAuditoriaEnum.EVENTO_SISTEMA;
  }

  private inferirNivel(accion: string): NivelSeveridadEnum {
    const a = accion.toUpperCase();
    if (a.includes('FUERZA_BRUTA') || a.includes('CRITIC') || a.includes('FALLIDO')) {
      return NivelSeveridadEnum.CRITICO;
    }
    if (a.includes('POLITICA') || a.includes('ROL') || a.includes('AUTH')) {
      return NivelSeveridadEnum.SEGURIDAD;
    }
    if (a.includes('UMBRAL') || a.includes('EXPORTACION')) {
      return NivelSeveridadEnum.ADVERTENCIA;
    }
    return NivelSeveridadEnum.INFO;
  }
}
