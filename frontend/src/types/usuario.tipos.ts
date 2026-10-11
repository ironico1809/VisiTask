export type Rol =
  | 'SUPER_ADMINISTRADOR'
  | 'ADMIN_ORGANIZACION'
  | 'SUPERVISOR'
  | 'EVALUADOR'
  | 'EMPLEADO'
  | 'POSTULANTE';

export interface Usuario {
  id: string;
  correo?: string;
  nombre?: string;
  apellido?: string;
  fotoUrl?: string;
  rol?: Rol | string;
  organizacionId?: string;
  nombreOrganizacion?: string;
  departamentoId?: string;

  // Propiedades de compatibilidad en inglés
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  organizationName?: string;
}

export interface UsuarioDetalle {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  fotoUrl?: string;
  rol: Rol | string;
  organizacionId?: string;
  nombreOrganizacion?: string;
  departamento?: string;
  activo: boolean;
  creadoEn: string | Date;
  ultimoAcceso?: string;
}

export interface CrearUsuarioEntrada {
  correo: string;
  nombre: string;
  apellido: string;
  clave?: string;
  rol: Rol | string;
  organizacionId?: string;
  nombreOrganizacion?: string;
  departamento?: string;
  fotoUrl?: string;
}

export interface ActualizarPerfilEntrada {
  nombre: string;
  apellido: string;
  fotoUrl?: string;
  claveActual?: string;
  claveNueva?: string;
}

export interface EstadoAutenticacion {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  estaCargando: boolean;

  // Compatibilidad
  user?: Usuario | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

// Alias de compatibilidad
export type Role = Rol;
export type User = Usuario;
export type AuthState = EstadoAutenticacion;
