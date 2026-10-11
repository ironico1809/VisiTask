export interface Organizacion {
  id: string;
  nombre: string;
  identificacionFiscal?: string;
  slug: string;
  logoUrl?: string;
  activo: boolean;
  plan: string;
  puestosActivos: number;
  totalColaboradores: number;
  creadoEn: string | Date;
}

export interface CrearOrganizacionEntrada {
  nombre: string;
  identificacionFiscal?: string;
  plan?: string;
  logoUrl?: string;
}

export interface ActualizarOrganizacionEntrada {
  nombre?: string;
  identificacionFiscal?: string;
  plan?: string;
  logoUrl?: string;
  activo?: boolean;
}
