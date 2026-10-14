import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generarHashRegistro(id, userId, action, entity, entityId, details, ipAddress, createdAt) {
  const payload = `${id}|${userId || 'SYSTEM'}|${action}|${entity}|${entityId || ''}|${JSON.stringify(
    details || {},
  )}|${ipAddress || '127.0.0.1'}|${createdAt.toISOString()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function sembrarAuditoria() {
  console.log('--- Conectando a Supabase PostgreSQL para sembrar CU26 ---');
  await prisma.$connect();

  const usuarios = await prisma.usuario.findMany({ take: 5 });
  console.log(`Usuarios disponibles en PostgreSQL: ${usuarios.length}`);

  const idAdmin = usuarios.find((u) => u.correo.includes('manuela') || u.correo.includes('admin'))?.id || usuarios[0]?.id;
  const idEval = usuarios.find((u) => u.correo.includes('marco') || u.correo.includes('carlos'))?.id || usuarios[1]?.id;
  const idSup = usuarios.find((u) => u.correo.includes('jairo') || u.correo.includes('juan'))?.id || usuarios[2]?.id;

  const ahora = new Date();
  const restarMin = (m) => new Date(ahora.getTime() - m * 60 * 1000);

  const eventos = [
    {
      id: 'aud-0001',
      userId: idAdmin || null,
      action: 'MODIFICACION_UMBRAL_RULA',
      entity: 'ConfiguracionAlerta',
      entityId: 'cfg-org-001',
      categoria: 'MODIFICACION_POLITICA',
      nivel: 'ADVERTENCIA',
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
      categoria: 'ACCESO_DATOS',
      nivel: 'INFO',
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
      categoria: 'MODIFICACION_POLITICA',
      nivel: 'SEGURIDAD',
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
      categoria: 'ACCESO_DATOS',
      nivel: 'ADVERTENCIA',
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
      categoria: 'AUTENTICACION_SEGURIDAD',
      nivel: 'CRITICO',
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
      categoria: 'MODIFICACION_POLITICA',
      nivel: 'SEGURIDAD',
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
      categoria: 'EVENTO_SISTEMA',
      nivel: 'INFO',
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

  for (const ev of eventos) {
    const hash = generarHashRegistro(
      ev.id,
      ev.userId,
      ev.action,
      ev.entity,
      ev.entityId,
      ev.details,
      ev.ipAddress,
      ev.createdAt,
    );

    const detailsConMetadatos = {
      ...ev.details,
      categoria: ev.categoria,
      nivel: ev.nivel,
      hashIntegridad: hash,
      garantiaInmutabilidad: 'PostgreSQL Append-Only WORM Log',
    };

    await prisma.auditLog.upsert({
      where: { id: ev.id },
      create: {
        id: ev.id,
        userId: ev.userId,
        action: ev.action,
        entity: ev.entity,
        entityId: ev.entityId,
        ipAddress: ev.ipAddress,
        details: detailsConMetadatos,
        createdAt: ev.createdAt,
      },
      update: {
        details: detailsConMetadatos,
      },
    });
    console.log(`✓ Registro inmutable sembrado en PostgreSQL: ${ev.id} - ${ev.action}`);
  }

  const conteoFinal = await prisma.auditLog.count();
  console.log(`\n¡Sembrado exitoso! Total de registros en audit_logs de PostgreSQL: ${conteoFinal}`);
  await prisma.$disconnect();
}

sembrarAuditoria().catch((err) => {
  console.error('Error sembrando auditoría:', err);
  process.exit(1);
});
