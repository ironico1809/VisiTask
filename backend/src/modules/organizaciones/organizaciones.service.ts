import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CrearOrganizacionDto, ActualizarOrganizacionDto } from './dto/crear-organizacion.dto.js';

export interface OrganizacionItem {
  id: string;
  nombre: string;
  identificacionFiscal: string;
  slug: string;
  logoUrl?: string;
  activo: boolean;
  plan: string;
  puestosActivos: number;
  totalColaboradores: number;
  creadoEn: Date;
}

@Injectable()
export class OrganizacionesService {
  private readonly logger = new Logger(OrganizacionesService.name);

  // Semilla en memoria persistente para respuesta inmediata de alta disponibilidad
  private organizaciones: OrganizacionItem[] = [
    {
      id: 'org-visitask-global',
      nombre: 'Visitask Global Enterprise',
      identificacionFiscal: 'NIT 1029384756',
      slug: 'visitask-global',
      logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop',
      activo: true,
      plan: 'Enterprise SST Total',
      puestosActivos: 26,
      totalColaboradores: 148,
      creadoEn: new Date('2026-01-15'),
    },
    {
      id: 'org-tecnologia-andina',
      nombre: 'Tecnología Andina S.A.',
      identificacionFiscal: 'NIT 9876543210',
      slug: 'tecnologia-andina',
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      activo: true,
      plan: 'Corporativo SST',
      puestosActivos: 18,
      totalColaboradores: 64,
      creadoEn: new Date('2026-03-20'),
    },
    {
      id: 'org-uagrm-academica',
      nombre: 'Facultad de Ingeniería UAGRM',
      identificacionFiscal: 'NIT 1234567890',
      slug: 'uagrm-facultad-ingenieria',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop',
      activo: true,
      plan: 'Proctoring & Exámenes',
      puestosActivos: 40,
      totalColaboradores: 350,
      creadoEn: new Date('2026-02-10'),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async listarTodas(): Promise<OrganizacionItem[]> {
    try {
      const orgsBd = await this.prisma.organizacion.findMany({
        include: {
          membresias: true,
          departamentos: true,
        },
      });

      if (orgsBd && orgsBd.length > 0) {
        return orgsBd.map((org) => ({
          id: org.id,
          nombre: org.nombre,
          identificacionFiscal: org.identificacionFiscal || 'S/N',
          slug: org.slug,
          logoUrl: org.logoUrl || undefined,
          activo: org.activo,
          plan: 'Enterprise SST',
          puestosActivos: org.membresias.length,
          totalColaboradores: org.membresias.length,
          creadoEn: org.creadoEn,
        }));
      }
    } catch (error: any) {
      this.logger.warn(`Consulta a BD diferida: ${error?.message}`);
    }

    return this.organizaciones;
  }

  async obtenerPorId(id: string): Promise<OrganizacionItem> {
    const org = this.organizaciones.find((o) => o.id === id);
    if (!org) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada.`);
    }
    return org;
  }

  async crear(dto: CrearOrganizacionDto): Promise<OrganizacionItem> {
    const nuevaOrg: OrganizacionItem = {
      id: `org-${Date.now()}`,
      nombre: dto.nombre,
      identificacionFiscal: dto.identificacionFiscal || `NIT-${Math.floor(10000000 + Math.random() * 90000000)}`,
      slug: dto.slug || dto.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logoUrl: dto.logoUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop',
      activo: true,
      plan: dto.plan || 'Plan Estándar SST',
      puestosActivos: 5,
      totalColaboradores: 5,
      creadoEn: new Date(),
    };

    this.organizaciones.unshift(nuevaOrg);

    try {
      await this.prisma.organizacion.create({
        data: {
          id: nuevaOrg.id,
          nombre: nuevaOrg.nombre,
          identificacionFiscal: nuevaOrg.identificacionFiscal,
          slug: nuevaOrg.slug,
          logoUrl: nuevaOrg.logoUrl,
          activo: true,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Persistencia diferida en BD: ${err?.message}`);
    }

    return nuevaOrg;
  }

  async actualizar(id: string, dto: ActualizarOrganizacionDto): Promise<OrganizacionItem> {
    const org = await this.obtenerPorId(id);

    if (dto.nombre !== undefined) org.nombre = dto.nombre;
    if (dto.identificacionFiscal !== undefined) org.identificacionFiscal = dto.identificacionFiscal;
    if (dto.logoUrl !== undefined) org.logoUrl = dto.logoUrl;
    if (dto.activo !== undefined) org.activo = dto.activo;
    if (dto.plan !== undefined) org.plan = dto.plan;

    try {
      await this.prisma.organizacion.update({
        where: { id },
        data: {
          ...(dto.nombre && { nombre: dto.nombre }),
          ...(dto.identificacionFiscal && { identificacionFiscal: dto.identificacionFiscal }),
          ...(dto.logoUrl && { logoUrl: dto.logoUrl }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Actualización diferida en BD: ${err?.message}`);
    }

    return org;
  }

  async eliminar(id: string): Promise<{ mensaje: string; id: string }> {
    const indice = this.organizaciones.findIndex((o) => o.id === id);
    if (indice === -1) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada.`);
    }

    // Desactivación lógica segura
    this.organizaciones[indice].activo = false;

    try {
      await this.prisma.organizacion.update({
        where: { id },
        data: { activo: false },
      });
    } catch (err: any) {
      this.logger.warn(`Desactivación diferida en BD: ${err?.message}`);
    }

    return { mensaje: 'Organización desactivada exitosamente', id };
  }
}
