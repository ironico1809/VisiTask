import { api } from './api.js';
import type {
  Organizacion,
  CrearOrganizacionEntrada,
  ActualizarOrganizacionEntrada,
} from '../types/organizacion.tipos.js';

export const servicioOrganizaciones = {
  async listar(): Promise<Organizacion[]> {
    const respuesta = await api.get<Organizacion[]>('/organizaciones');
    return respuesta.data;
  },

  async obtenerPorId(id: string): Promise<Organizacion> {
    const respuesta = await api.get<Organizacion>(`/organizaciones/${id}`);
    return respuesta.data;
  },

  async crear(datos: CrearOrganizacionEntrada): Promise<Organizacion> {
    const respuesta = await api.post<Organizacion>('/organizaciones', datos);
    return respuesta.data;
  },

  async actualizar(
    id: string,
    datos: ActualizarOrganizacionEntrada,
  ): Promise<Organizacion> {
    const respuesta = await api.put<Organizacion>(`/organizaciones/${id}`, datos);
    return respuesta.data;
  },

  async eliminar(id: string): Promise<{ mensaje: string; id: string }> {
    const respuesta = await api.delete<{ mensaje: string; id: string }>(
      `/organizaciones/${id}`,
    );
    return respuesta.data;
  },
};
