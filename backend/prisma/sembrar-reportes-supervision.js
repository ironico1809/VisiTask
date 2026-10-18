import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sembrarReportesYSupervision() {
  console.log('--- Sembrando Módulos de Reportes, Supervisión y Ergonomía en PostgreSQL ---');

  // 1. Obtener usuario y organización de referencia
  const usuarios = await prisma.usuario.findMany({ take: 5 });
  const org = await prisma.organizacion.findFirst();

  if (usuarios.length === 0 || !org) {
    console.log('No se encontraron usuarios u organizaciones. Ejecute primero semilla.js.');
    return;
  }

  const usuarioAdmin = usuarios.find((u) => u.correo.includes('manuela')) || usuarios[0];
  const usuarioEmpleado = usuarios.find((u) => u.correo.includes('juan')) || usuarios[1] || usuarios[0];
  const usuarioPostulante = usuarios.find((u) => u.correo.includes('candidato') || u.correo.includes('demo')) || usuarios[2] || usuarios[0];

  // 2. Evaluaciones Técnicas (Assessments)
  const evaluacion = await prisma.assessment.upsert({
    where: { accessCode: 'UAGRM-2026-ING' },
    create: {
      id: 'asm-uagrm-eval-2026',
      organizationId: org.id,
      title: 'Evaluación Técnica de Selección de Software e Ingeniería',
      description: 'Prueba agnóstica supervisada con monitoreo de mirada, telemetría y portapapeles',
      externalFormUrl: 'https://docs.google.com/forms/d/e/exam-uagrm-2026/viewform',
      accessCode: 'UAGRM-2026-ING',
      durationMinutes: 60,
      isActive: true,
    },
    update: {
      title: 'Evaluación Técnica de Selección de Software e Ingeniería',
      externalFormUrl: 'https://docs.google.com/forms/d/e/exam-uagrm-2026/viewform',
    },
  });

  // 3. Sesión de Supervisión Activa
  const sesionSupervision = await prisma.supervisionSession.upsert({
    where: { id: 'ses-supervision-01' },
    create: {
      id: 'ses-supervision-01',
      userId: usuarioPostulante.id,
      assessmentId: evaluacion.id,
      mode: 'EXAM',
      status: 'ACTIVE',
      startTime: new Date(Date.now() - 25 * 60 * 1000), // Hace 25 minutos
    },
    update: {
      status: 'ACTIVE',
    },
  });

  // 4. Telemetría de Supervisión
  const conteoTelemetria = await prisma.telemetryEvent.count({
    where: { supervisionSessionId: sesionSupervision.id },
  });
  if (conteoTelemetria === 0) {
    await prisma.telemetryEvent.createMany({
      data: [
        {
          id: 'tel-01',
          supervisionSessionId: sesionSupervision.id,
          type: 'SHORTCUT_BLOCKED',
          details: 'Intento de combinación Alt+Tab interceptado por el guardián de ventana',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: 'tel-02',
          supervisionSessionId: sesionSupervision.id,
          type: 'CLIPBOARD_PASTE_BLOCKED',
          details: 'Intento de pegar contenido bloqueado en sandbox de evaluación',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
        },
        {
          id: 'tel-03',
          supervisionSessionId: sesionSupervision.id,
          type: 'WINDOW_BLUR',
          details: 'Pérdida de foco de pestaña por 3.4 segundos',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
        },
      ],
    });
  }

  // 4.1 Telemetría de Mirada Ocular (Gaze Events)
  const conteoMirada = await prisma.gazeEvent.count({
    where: { supervisionSessionId: sesionSupervision.id },
  });
  if (conteoMirada === 0) {
    await prisma.gazeEvent.createMany({
      data: [
        {
          id: 'gaze-01',
          supervisionSessionId: sesionSupervision.id,
          pitch: -2.4,
          yaw: 1.1,
          roll: 0.2,
          irisOffsetX: 0.02,
          irisOffsetY: -0.01,
          isSuspectedLapPhone: false,
          durationSeconds: 12.5,
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
        },
        {
          id: 'gaze-02',
          supervisionSessionId: sesionSupervision.id,
          pitch: -28.4,
          yaw: 12.1,
          roll: -3.5,
          irisOffsetX: 0.15,
          irisOffsetY: -0.38,
          isSuspectedLapPhone: true,
          durationSeconds: 4.8,
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
        },
        {
          id: 'gaze-03',
          supervisionSessionId: sesionSupervision.id,
          pitch: 3.2,
          yaw: -15.8,
          roll: 1.1,
          irisOffsetX: -0.22,
          irisOffsetY: 0.05,
          isSuspectedLapPhone: false,
          durationSeconds: 2.1,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          id: 'gaze-04',
          supervisionSessionId: sesionSupervision.id,
          pitch: -1.2,
          yaw: 0.5,
          roll: 0.0,
          irisOffsetX: 0.01,
          irisOffsetY: 0.01,
          isSuspectedLapPhone: false,
          durationSeconds: 18.0,
          timestamp: new Date(Date.now() - 1 * 60 * 1000),
        },
      ],
    });
  }

  // 5. Incidentes de Supervisión
  const conteoIncidentes = await prisma.incident.count({
    where: { supervisionSessionId: sesionSupervision.id },
  });
  if (conteoIncidentes === 0) {
    await prisma.incident.create({
      data: {
        id: 'inc-01',
        supervisionSessionId: sesionSupervision.id,
        title: 'Desvío ocular sostenido hacia dispositivo externo',
        description: 'El candidato desvió la mirada hacia el plano inferior fuera de pantalla durante 4.8s continuos.',
        severity: 'HIGH',
        status: 'FLAGGED_AUTOMATIC',
        correlatedRule: 'CORR-REG-03: Desvío de mirada persistente',
        evidenceSummary: {
          pitchDelta: -28.4,
          yawDelta: 12.1,
          duracionSegundos: 4.8,
          probabilidadLapPhone: 0.91,
        },
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
    });
  }

  // 5.1 Preguntas de Control Tipo Entrevista
  const preguntasEntrevista = [
    {
      id: 'ques-01',
      assessmentId: evaluacion.id,
      questionText: '¿El código o solución presentada fue redactada íntegramente por usted sin ayuda externa ni mensajería?',
      orderIndex: 0,
    },
    {
      id: 'ques-02',
      assessmentId: evaluacion.id,
      questionText: '¿Consultó o utilizó herramientas no declaradas como asistentes de IA generativa durante el ejercicio?',
      orderIndex: 1,
    },
    {
      id: 'ques-03',
      assessmentId: evaluacion.id,
      questionText: '¿Confirma que no recibió asistencia remota ni utilizó dispositivos adicionales durante la sesión?',
      orderIndex: 2,
    },
    {
      id: 'ques-04',
      assessmentId: evaluacion.id,
      questionText: '¿Puede explicar verbalmente en 15 segundos la lógica del algoritmo principal que implementó?',
      orderIndex: 3,
    },
  ];

  for (const q of preguntasEntrevista) {
    await prisma.interviewQuestion.upsert({
      where: { id: q.id },
      create: q,
      update: q,
    });
  }

  // 5.2 Reacción Biométrica Registrada
  await prisma.interviewReaction.upsert({
    where: { id: 'reac-01' },
    create: {
      id: 'reac-01',
      supervisionSessionId: sesionSupervision.id,
      questionId: 'ques-01',
      stimulusTimestamp: new Date(Date.now() - 15 * 60 * 1000),
      reactionLatencyMs: 680,
      facialTensionDelta: 0.38,
      smileIncongruityScore: 0.12,
      surpriseScore: 0.28,
      cognitiveStressScore: 0.45,
    },
    update: {
      reactionLatencyMs: 680,
      facialTensionDelta: 0.38,
    },
  });

  // 6. Sesión Ergonómica de Trabajo
  const sesionErgo = await prisma.ergonomicSession.upsert({
    where: { id: 'ses-ergo-01' },
    create: {
      id: 'ses-ergo-01',
      userId: usuarioEmpleado.id,
      startTime: new Date(Date.now() - 120 * 60 * 1000), // Hace 2 horas
      averageRula: 3.8,
      maxRula: 6,
      totalAlerts: 3,
    },
    update: {
      averageRula: 3.8,
      maxRula: 6,
      totalAlerts: 3,
    },
  });

  // 7. Línea Base de Calibración
  const conteoCalibracion = await prisma.calibrationBaseline.count({
    where: { sessionId: sesionErgo.id },
  });
  if (conteoCalibracion === 0) {
    await prisma.calibrationBaseline.create({
      data: {
        id: 'cal-01',
        sessionId: sesionErgo.id,
        neutralNeckAngle: 12.0,
        neutralTrunkAngle: 8.5,
        neutralShoulderDist: 34.2,
        ambientLighting: 380,
      },
    });
  }

  // 8. Registros Posturales
  const conteoPosturas = await prisma.postureLog.count({
    where: { sessionId: sesionErgo.id },
  });
  if (conteoPosturas === 0) {
    await prisma.postureLog.createMany({
      data: [
        {
          id: 'pos-01',
          sessionId: sesionErgo.id,
          rulaScore: 2,
          neckAngle: 11.5,
          trunkAngle: 7.8,
          shoulderAngle: 5.2,
          isStatic: false,
          staticSeconds: 15,
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
        },
        {
          id: 'pos-02',
          sessionId: sesionErgo.id,
          rulaScore: 4,
          neckAngle: 21.0,
          trunkAngle: 16.4,
          shoulderAngle: 12.1,
          isStatic: true,
          staticSeconds: 45,
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
        },
        {
          id: 'pos-03',
          sessionId: sesionErgo.id,
          rulaScore: 6,
          neckAngle: 28.5,
          trunkAngle: 22.0,
          shoulderAngle: 18.0,
          isStatic: true,
          staticSeconds: 65,
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
        },
      ],
    });
  }

  // 9. Reportes Oficiales en PostgreSQL
  const reportes = [
    {
      id: 'rep-01',
      supervisionSessionId: sesionSupervision.id,
      type: 'ERGONOMIC_SST_CORPORATE',
      title: 'Auditoría Mensual Ergonómica (RULA/REBA) - Puestos Operativos',
      pdfUrl: '/api/reportes/rep-01/descargar?formato=pdf',
      excelUrl: '/api/reportes/rep-01/descargar?formato=xlsx',
      summaryMetrics: {
        periodo: 'Octubre 2026',
        totalPersonal: 26,
        tasaRiesgo: '7.6%',
        horasEvaluadas: 1420,
        reduccionRiesgo: '-34.8%',
        cumplimientoPausasActivas: '92.4%',
        normativa: 'ISO 11226 / EN 1005-4',
        hashIntegridadSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      generatedAt: new Date('2026-10-05T09:00:00Z'),
    },
    {
      id: 'rep-02',
      supervisionSessionId: null,
      type: 'ERGONOMIC_SST_CORPORATE',
      title: 'Informe de Pausas Activas y Fatiga Acumulada - Jornada Continua',
      pdfUrl: '/api/reportes/rep-02/descargar?formato=pdf',
      excelUrl: '/api/reportes/rep-02/descargar?formato=xlsx',
      summaryMetrics: {
        periodo: 'Septiembre 2026',
        totalPersonal: 24,
        tasaRiesgo: '11.2%',
        horasEvaluadas: 1280,
        reduccionRiesgo: '-28.1%',
        cumplimientoPausasActivas: '88.1%',
        normativa: 'ISO 11226 / RULA Nivel 2-3',
        hashIntegridadSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      },
      generatedAt: new Date('2026-09-20T14:30:00Z'),
    },
    {
      id: 'rep-03',
      supervisionSessionId: sesionSupervision.id,
      type: 'FORENSIC_EXAM_INDIVIDUAL',
      title: 'Expediente Forense de Integridad en Evaluaciones Técnicas',
      pdfUrl: '/api/reportes/rep-03/descargar?formato=pdf',
      excelUrl: '/api/reportes/rep-03/descargar?formato=xlsx',
      summaryMetrics: {
        periodo: 'Septiembre 2026',
        totalPersonal: 18,
        tasaRiesgo: '0 desvíos no justificados',
        incidentesCorrelacionados: 1,
        indiceIntegridadPromedio: 94.1,
        normativa: 'Supervisión Proctoring Agnóstica WORM',
        hashIntegridadSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      },
      generatedAt: new Date('2026-09-30T17:00:00Z'),
    },
  ];

  for (const r of reportes) {
    await prisma.report.upsert({
      where: { id: r.id },
      create: r,
      update: r,
    });
  }

  console.log('--- ¡Sembrado de Reportes, Supervisión y Ergonomía Finalizado con Éxito! ---');
}

sembrarReportesYSupervision()
  .catch((e) => {
    console.error('Error durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
