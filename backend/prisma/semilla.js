import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function sembrarBaseDeDatos() {
  console.log('--- Iniciando Semilla de Base de Datos PostgreSQL Supabase ---');

  const claveHashComun = await bcrypt.hash('12345', 10);

  // 1. Organizaciones
  const organizaciones = [
    {
      id: 'org-visitask-global',
      nombre: 'Visitask Global Enterprise',
      identificacionFiscal: 'NIT 1029384756',
      slug: 'visitask-global',
      logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop',
      activo: true,
    },
    {
      id: 'org-tecnologia-andina',
      nombre: 'Tecnología Andina S.A.',
      identificacionFiscal: 'NIT 9876543210',
      slug: 'tecnologia-andina',
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      activo: true,
    },
    {
      id: 'org-uagrm-academica',
      nombre: 'Facultad de Ingeniería UAGRM',
      identificacionFiscal: 'NIT 1234567890',
      slug: 'uagrm-facultad-ingenieria',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop',
      activo: true,
    },
  ];

  for (const org of organizaciones) {
    await prisma.organizacion.upsert({
      where: { id: org.id },
      create: org,
      update: org,
    });
  }

  // 2. Usuarios del Directorio RBAC
  const usuarios = [
    {
      id: 'usr-manuela-root',
      correo: 'manuela@gmail.com',
      nombre: 'Manuela',
      apellido: 'Administradora',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPER_ADMINISTRADOR',
      orgId: 'org-visitask-global',
    },
    {
      id: 'usr-carlos-01',
      correo: 'carlos.mendoza@visitask.com',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
      rol: 'ADMIN_ORGANIZACION',
      orgId: 'org-visitask-global',
    },
    {
      id: 'usr-jairo-02',
      correo: 'jairo.camacho@visitask.com',
      nombre: 'Jairo',
      apellido: 'Camacho',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPERVISOR',
      orgId: 'org-tecnologia-andina',
    },
    {
      id: 'usr-marco-03',
      correo: 'marco.lopez@visitask.com',
      nombre: 'Marco',
      apellido: 'López',
      fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop&crop=faces',
      rol: 'EVALUADOR',
      orgId: 'org-uagrm-academica',
    },
    {
      id: 'usr-juan-04',
      correo: 'juan.matienzo@visitask.com',
      nombre: 'Juan Manuel',
      apellido: 'Matienzo',
      fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=faces',
      rol: 'EMPLEADO',
      orgId: 'org-visitask-global',
    },
    {
      id: 'usr-postulante-05',
      correo: 'candidato.demo@gmail.com',
      nombre: 'Ana María',
      apellido: 'Suárez',
      fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
      rol: 'POSTULANTE',
      orgId: 'org-uagrm-academica',
    },
    {
      id: 'usr-sofia-06',
      correo: 'sofia.vargas@andina.com',
      nombre: 'Sofía',
      apellido: 'Vargas',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPERVISOR',
      orgId: 'org-tecnologia-andina',
    },
    {
      id: 'usr-roberto-07',
      correo: 'roberto.fernandez@uagrm.edu.bo',
      nombre: 'Roberto',
      apellido: 'Fernández',
      fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces',
      rol: 'ADMIN_ORGANIZACION',
      orgId: 'org-uagrm-academica',
    },
  ];

  for (const u of usuarios) {
    const usuarioCreado = await prisma.usuario.upsert({
      where: { correo: u.correo },
      create: {
        id: u.id,
        correo: u.correo,
        claveHash: claveHashComun,
        nombre: u.nombre,
        apellido: u.apellido,
        fotoUrl: u.fotoUrl,
        activo: true,
      },
      update: {
        claveHash: claveHashComun,
        nombre: u.nombre,
        apellido: u.apellido,
        fotoUrl: u.fotoUrl,
        activo: true,
      },
    });

    await prisma.usuarioOrganizacion.upsert({
      where: {
        usuarioId_organizacionId: {
          usuarioId: usuarioCreado.id,
          organizacionId: u.orgId,
        },
      },
      create: {
        id: `rel-${u.id}`,
        usuarioId: usuarioCreado.id,
        organizacionId: u.orgId,
        rol: u.rol,
      },
      update: {
        rol: u.rol,
      },
    });
  }

  // 3. Suscripciones
  const suscripciones = [
    {
      id: 'sub-visitask-01',
      organizationId: 'org-visitask-global',
      planType: 'ENTERPRISE_CUSTOM',
      status: 'ACTIVE',
      seatsAllocated: 50,
      examsAllocated: 500,
      examsUsed: 148,
      currentPeriodStart: new Date('2026-01-01'),
      currentPeriodEnd: new Date('2027-01-01'),
    },
    {
      id: 'sub-andina-02',
      organizationId: 'org-tecnologia-andina',
      planType: 'SAAS_SEAT_MONTHLY',
      status: 'ACTIVE',
      seatsAllocated: 20,
      examsAllocated: 0,
      examsUsed: 0,
      currentPeriodStart: new Date('2026-03-01'),
      currentPeriodEnd: new Date('2026-11-01'),
    },
    {
      id: 'sub-uagrm-03',
      organizationId: 'org-uagrm-academica',
      planType: 'PAY_PER_EXAM_PACKAGE',
      status: 'ACTIVE',
      seatsAllocated: 5,
      examsAllocated: 500,
      examsUsed: 350,
      currentPeriodStart: new Date('2026-02-01'),
      currentPeriodEnd: new Date('2026-12-01'),
    },
  ];

  for (const s of suscripciones) {
    await prisma.subscription.upsert({
      where: { id: s.id },
      create: s,
      update: s,
    });
  }

  // 4. Facturas
  const facturas = [
    {
      id: 'inv-004',
      subscriptionId: 'sub-visitask-01',
      invoiceNumber: 'INV-2026-004',
      amount: 590.0,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date('2026-10-01'),
    },
    {
      id: 'inv-003',
      subscriptionId: 'sub-visitask-01',
      invoiceNumber: 'INV-2026-003',
      amount: 590.0,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date('2026-09-01'),
    },
    {
      id: 'inv-002',
      subscriptionId: 'sub-andina-02',
      invoiceNumber: 'INV-2026-002',
      amount: 300.0,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date('2026-09-01'),
    },
    {
      id: 'inv-001',
      subscriptionId: 'sub-uagrm-03',
      invoiceNumber: 'INV-2026-001',
      amount: 1500.0,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date('2026-02-01'),
    },
  ];

  for (const f of facturas) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: f.invoiceNumber },
      create: f,
      update: f,
    });
  }

  // 5. Consentimientos Informados Digitales
  const consentimientos = [
    {
      id: 'cons-manuela-01',
      userId: 'usr-manuela-root',
      type: 'TERMS_AND_PRIVACY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '190.181.45.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      acceptedAt: new Date('2026-01-15T08:30:00Z'),
    },
    {
      id: 'cons-manuela-02',
      userId: 'usr-manuela-root',
      type: 'CAMERA_AND_BIOMETRICS',
      version: '1.0',
      isAccepted: true,
      ipAddress: '190.181.45.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      acceptedAt: new Date('2026-01-15T08:31:00Z'),
    },
    {
      id: 'cons-manuela-03',
      userId: 'usr-manuela-root',
      type: 'TELEMETRY_AND_ACTIVITY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '190.181.45.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      acceptedAt: new Date('2026-01-15T08:31:00Z'),
    },
    {
      id: 'cons-carlos-01',
      userId: 'usr-carlos-01',
      type: 'TERMS_AND_PRIVACY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '181.115.129.80',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0',
      acceptedAt: new Date('2026-02-01T09:15:00Z'),
    },
    {
      id: 'cons-carlos-02',
      userId: 'usr-carlos-01',
      type: 'CAMERA_AND_BIOMETRICS',
      version: '1.0',
      isAccepted: true,
      ipAddress: '181.115.129.80',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0',
      acceptedAt: new Date('2026-02-01T09:16:00Z'),
    },
    {
      id: 'cons-juan-01',
      userId: 'usr-juan-04',
      type: 'CAMERA_AND_BIOMETRICS',
      version: '1.0',
      isAccepted: true,
      ipAddress: '200.87.144.55',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/129.0',
      acceptedAt: new Date('2026-03-10T14:00:00Z'),
    },
    {
      id: 'cons-juan-02',
      userId: 'usr-juan-04',
      type: 'TELEMETRY_AND_ACTIVITY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '200.87.144.55',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/129.0',
      acceptedAt: new Date('2026-03-10T14:01:00Z'),
    },
    {
      id: 'cons-postulante-01',
      userId: 'usr-postulante-05',
      type: 'TERMS_AND_PRIVACY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '186.2.140.22',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0',
      acceptedAt: new Date('2026-10-10T16:00:00Z'),
    },
    {
      id: 'cons-postulante-02',
      userId: 'usr-postulante-05',
      type: 'CAMERA_AND_BIOMETRICS',
      version: '1.0',
      isAccepted: true,
      ipAddress: '186.2.140.22',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0',
      acceptedAt: new Date('2026-10-10T16:01:00Z'),
    },
    {
      id: 'cons-postulante-03',
      userId: 'usr-postulante-05',
      type: 'TELEMETRY_AND_ACTIVITY',
      version: '1.0',
      isAccepted: true,
      ipAddress: '186.2.140.22',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0',
      acceptedAt: new Date('2026-10-10T16:01:30Z'),
    },
  ];

  for (const c of consentimientos) {
    await prisma.legalConsent.upsert({
      where: { id: c.id },
      create: c,
      update: c,
    });
  }

  // 6. Alertas Ergonómicas y SST
  const alertas = [
    {
      id: 'alt-ergo-01',
      userId: 'usr-juan-04',
      type: 'POSTURAL_RISK_PROLONGED',
      level: 'HIGH',
      message: 'Inclinación cervical excesiva (cuello > 28°) sostenida por más de 60 segundos.',
      isSentToMobile: true,
      isDismissed: false,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      id: 'alt-ergo-02',
      userId: 'usr-juan-04',
      type: 'STATIC_OVERLOAD',
      level: 'MEDIUM',
      message: 'Sobrecarga estática detectada en trapecios: sin variación postural en 15 minutos.',
      isSentToMobile: false,
      isDismissed: true,
      createdAt: new Date(Date.now() - 75 * 60 * 1000),
    },
    {
      id: 'alt-ergo-03',
      userId: 'usr-juan-04',
      type: 'EYE_BREAK_20_20_20',
      level: 'LOW',
      message: 'Pausa preventiva 20-20-20 recomendada: descanse la vista enfocando a 6 metros.',
      isSentToMobile: true,
      isDismissed: false,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      id: 'alt-ergo-04',
      userId: 'usr-carlos-01',
      type: 'FATIGUE_ACCUMULATED',
      level: 'CRITICAL',
      message: 'Índice de fatiga muscular acumulada superior al 80%. Se aconseja pausa activa inmediata.',
      isSentToMobile: true,
      isDismissed: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: 'alt-ergo-05',
      userId: 'usr-manuela-root',
      type: 'ANOMALY_BEHAVIOR',
      level: 'MEDIUM',
      message: 'Asimetría severa de hombros detectada durante la sesión de trabajo.',
      isSentToMobile: false,
      isDismissed: true,
      createdAt: new Date(Date.now() - 120 * 60 * 1000),
    },
  ];

  for (const a of alertas) {
    await prisma.alert.upsert({
      where: { id: a.id },
      create: a,
      update: a,
    });
  }

  console.log('--- ¡Semilla completada exitosamente en PostgreSQL Supabase! ---');
}

sembrarBaseDeDatos()
  .catch((e) => {
    console.error('Error durante la semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
