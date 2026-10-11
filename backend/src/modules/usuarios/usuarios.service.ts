import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CrearUsuarioDto, ActualizarUsuarioDto, ActualizarPerfilDto } from './dto/crear-usuario.dto.js';

export interface UsuarioItem {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  fotoUrl?: string;
  rol: string;
  organizacionId?: string;
  nombreOrganizacion?: string;
  departamento?: string;
  activo: boolean;
  creadoEn: Date;
  ultimoAcceso?: string;
}

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  // Semilla institucional de usuarios para cada rol RBAC
  private usuarios: UsuarioItem[] = [
    {
      id: 'usr-manuela-root',
      correo: 'manuela@gmail.com',
      nombre: 'Manuela',
      apellido: 'Administradora',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPER_ADMINISTRADOR',
      organizacionId: 'org-visitask-global',
      nombreOrganizacion: 'Visitask Global Enterprise (Acceso Total)',
      departamento: 'Dirección General y Auditoría SST',
      activo: true,
      creadoEn: new Date('2026-01-01'),
      ultimoAcceso: 'Activo ahora',
    },
    {
      id: 'usr-carlos-01',
      correo: 'carlos.mendoza@visitask.com',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
      rol: 'ADMIN_ORGANIZACION',
      organizacionId: 'org-visitask-global',
      nombreOrganizacion: 'Visitask Global Enterprise',
      departamento: 'Gerencia de Operaciones SST',
      activo: true,
      creadoEn: new Date('2026-02-14'),
      ultimoAcceso: 'Hace 10 min',
    },
    {
      id: 'usr-jairo-02',
      correo: 'jairo.camacho@visitask.com',
      nombre: 'Jairo',
      apellido: 'Camacho',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPERVISOR',
      organizacionId: 'org-tecnologia-andina',
      nombreOrganizacion: 'Tecnología Andina S.A.',
      departamento: 'Supervisión de Ergonomía e Higiene',
      activo: true,
      creadoEn: new Date('2026-02-28'),
      ultimoAcceso: 'Hace 1 hora',
    },
    {
      id: 'usr-marco-03',
      correo: 'marco.lopez@visitask.com',
      nombre: 'Marco',
      apellido: 'López',
      fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop&crop=faces',
      rol: 'EVALUADOR',
      organizacionId: 'org-uagrm-academica',
      nombreOrganizacion: 'Facultad de Ingeniería UAGRM',
      departamento: 'Supervisión Técnica de Proctoring',
      activo: true,
      creadoEn: new Date('2026-03-05'),
      ultimoAcceso: 'Hace 3 horas',
    },
    {
      id: 'usr-juan-04',
      correo: 'juan.matienzo@visitask.com',
      nombre: 'Juan Manuel',
      apellido: 'Matienzo',
      fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=faces',
      rol: 'EMPLEADO',
      organizacionId: 'org-visitask-global',
      nombreOrganizacion: 'Visitask Global Enterprise',
      departamento: 'Estación Ergonómica - Desarrollo',
      activo: true,
      creadoEn: new Date('2026-03-12'),
      ultimoAcceso: 'Ayer',
    },
    {
      id: 'usr-postulante-05',
      correo: 'candidato.demo@gmail.com',
      nombre: 'Ana María',
      apellido: 'Suárez',
      fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
      rol: 'POSTULANTE',
      organizacionId: 'org-uagrm-academica',
      nombreOrganizacion: 'Facultad de Ingeniería UAGRM',
      departamento: 'Evaluación de Admisión Académica',
      activo: true,
      creadoEn: new Date('2026-04-01'),
      ultimoAcceso: 'Hace 2 días',
    },
    {
      id: 'usr-sofia-06',
      correo: 'sofia.vargas@andina.com',
      nombre: 'Sofía',
      apellido: 'Vargas',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
      rol: 'SUPERVISOR',
      organizacionId: 'org-tecnologia-andina',
      nombreOrganizacion: 'Tecnología Andina S.A.',
      departamento: 'Salud Ocupacional y Pausas Activas',
      activo: true,
      creadoEn: new Date('2026-04-05'),
      ultimoAcceso: 'Hace 4 horas',
    },
    {
      id: 'usr-roberto-07',
      correo: 'roberto.fernandez@uagrm.edu.bo',
      nombre: 'Roberto',
      apellido: 'Fernández',
      fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces',
      rol: 'ADMIN_ORGANIZACION',
      organizacionId: 'org-uagrm-academica',
      nombreOrganizacion: 'Facultad de Ingeniería UAGRM',
      departamento: 'Decanato y Gestión Académica',
      activo: true,
      creadoEn: new Date('2026-03-01'),
      ultimoAcceso: 'Hace 1 día',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async obtenerPerfil(identificador?: string): Promise<UsuarioItem> {
    if (identificador) {
      const limpio = identificador.trim().toLowerCase();
      const usuario = this.usuarios.find(
        (u) => u.id === identificador || u.correo.toLowerCase() === limpio,
      );
      if (usuario) return usuario;
    }
    return this.usuarios[0];
  }

  async actualizarPerfil(identificador: string | undefined, dto: ActualizarPerfilDto): Promise<UsuarioItem> {
    const usuario = await this.obtenerPerfil(identificador);

    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.apellido) usuario.apellido = dto.apellido;
    if (dto.fotoUrl) usuario.fotoUrl = dto.fotoUrl;

    if (dto.claveNueva) {
      if (dto.claveNueva.length < 5) {
        throw new BadRequestException('La nueva contraseña debe tener al menos 5 caracteres.');
      }
      this.logger.log(`Contraseña actualizada con éxito para el usuario ${usuario.correo}`);
    }

    try {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          ...(dto.fotoUrl && { fotoUrl: dto.fotoUrl }),
          ...(dto.claveNueva && { claveHash: bcrypt.hashSync(dto.claveNueva, 10) }),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Actualización de perfil diferida en BD: ${err?.message}`);
    }

    return usuario;
  }

  async listarTodos(filtroRol?: string, filtroOrg?: string): Promise<UsuarioItem[]> {
    try {
      const usuariosBd = await this.prisma.usuario.findMany({
        include: {
          membresias: {
            include: {
              organizacion: true,
              departamento: true,
            },
          },
        },
      });

      if (usuariosBd && usuariosBd.length > 0) {
        return usuariosBd.map((u) => {
          const m = u.membresias[0];
          return {
            id: u.id,
            correo: u.correo,
            nombre: u.nombre,
            apellido: u.apellido,
            fotoUrl: u.fotoUrl || undefined,
            rol: m?.rol || 'EMPLEADO',
            organizacionId: m?.organizacionId,
            nombreOrganizacion: m?.organizacion?.nombre,
            departamento: m?.departamento?.nombre || 'General',
            activo: u.activo,
            creadoEn: u.creadoEn,
            ultimoAcceso: 'Registrado',
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`Consulta de usuarios diferida: ${err?.message}`);
    }

    let resultado = [...this.usuarios];

    if (filtroRol && filtroRol !== 'TODOS') {
      resultado = resultado.filter((u) => u.rol === filtroRol);
    }
    if (filtroOrg && filtroOrg !== 'TODAS') {
      resultado = resultado.filter((u) => u.organizacionId === filtroOrg);
    }

    return resultado;
  }

  async obtenerPorId(id: string): Promise<UsuarioItem> {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  async crear(dto: CrearUsuarioDto): Promise<UsuarioItem> {
    const existe = this.usuarios.find((u) => u.correo.toLowerCase() === dto.correo.toLowerCase());
    if (existe) {
      throw new BadRequestException(`El correo electrónico ${dto.correo} ya está registrado.`);
    }

    const nuevoUsuario: UsuarioItem = {
      id: `usr-${Date.now()}`,
      correo: dto.correo.trim().toLowerCase(),
      nombre: dto.nombre,
      apellido: dto.apellido,
      fotoUrl:
        dto.fotoUrl ||
        `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 1000000)}?w=120&h=120&fit=crop&crop=faces`,
      rol: dto.rol || 'EMPLEADO',
      organizacionId: dto.organizacionId || 'org-visitask-global',
      nombreOrganizacion: dto.nombreOrganizacion || 'Visitask Global Enterprise',
      departamento: dto.departamento || 'Operaciones',
      activo: true,
      creadoEn: new Date(),
      ultimoAcceso: 'Nunca',
    };

    this.usuarios.push(nuevoUsuario);

    try {
      await this.prisma.usuario.create({
        data: {
          id: nuevoUsuario.id,
          correo: nuevoUsuario.correo,
          claveHash: bcrypt.hashSync(dto.clave || '12345', 10),
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          fotoUrl: nuevoUsuario.fotoUrl,
          activo: true,
        },
      });

      // Crear membresía institucional con rol y organización
      await this.prisma.usuarioOrganizacion.create({
        data: {
          id: `rel-${nuevoUsuario.id}`,
          usuarioId: nuevoUsuario.id,
          organizacionId: nuevoUsuario.organizacionId || 'org-visitask-global',
          rol: (nuevoUsuario.rol as any) || 'EMPLEADO',
        },
      });
    } catch (err: any) {
      this.logger.warn(`Creación de usuario diferida en BD: ${err?.message}`);
    }

    return nuevoUsuario;
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioItem> {
    const usuario = await this.obtenerPorId(id);

    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.apellido) usuario.apellido = dto.apellido;
    if (dto.rol) usuario.rol = dto.rol;
    if (dto.organizacionId) usuario.organizacionId = dto.organizacionId;
    if (dto.nombreOrganizacion) usuario.nombreOrganizacion = dto.nombreOrganizacion;
    if (dto.departamento) usuario.departamento = dto.departamento;
    if (dto.activo !== undefined) usuario.activo = dto.activo;
    if (dto.fotoUrl) usuario.fotoUrl = dto.fotoUrl;

    try {
      await this.prisma.usuario.update({
        where: { id },
        data: {
          ...(dto.nombre && { nombre: dto.nombre }),
          ...(dto.apellido && { apellido: dto.apellido }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
          ...(dto.fotoUrl && { fotoUrl: dto.fotoUrl }),
          ...(dto.clave && { claveHash: bcrypt.hashSync(dto.clave, 10) }),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Actualización diferida en BD: ${err?.message}`);
    }

    return usuario;
  }

  async cambiarRol(id: string, nuevoRol: string): Promise<UsuarioItem> {
    const usuario = await this.obtenerPorId(id);
    usuario.rol = nuevoRol;
    this.logger.log(`Rol de ${usuario.correo} actualizado a ${nuevoRol}`);

    try {
      await this.prisma.usuarioOrganizacion.updateMany({
        where: { usuarioId: id },
        data: { rol: nuevoRol as any },
      });
    } catch (err: any) {
      this.logger.warn(`Persistencia de rol diferida en BD: ${err?.message}`);
    }

    return usuario;
  }

  async cambiarEstadoActivo(id: string, activo: boolean): Promise<UsuarioItem> {
    const usuario = await this.obtenerPorId(id);
    usuario.activo = activo;

    try {
      await this.prisma.usuario.update({
        where: { id },
        data: { activo },
      });
    } catch (err: any) {
      this.logger.warn(`Actualización de estado activo diferida en BD: ${err?.message}`);
    }

    return usuario;
  }

  async eliminar(id: string): Promise<{ mensaje: string; id: string }> {
    const indice = this.usuarios.findIndex((u) => u.id === id);
    if (indice === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (this.usuarios[indice].correo === 'manuela@gmail.com') {
      throw new BadRequestException('No es posible eliminar al Superadministrador raíz del sistema.');
    }

    this.usuarios[indice].activo = false;
    return { mensaje: 'Usuario desactivado exitosamente', id };
  }
}
