import { api } from './api.js';
import type {
  UsuarioDetalle,
  CrearUsuarioEntrada,
  ActualizarPerfilEntrada,
} from '../types/usuario.tipos.js';

export const servicioUsuarios = {
  async obtenerPerfil(): Promise<UsuarioDetalle> {
    const respuesta = await api.get<UsuarioDetalle>('/usuarios/perfil');
    return respuesta.data;
  },

  async actualizarPerfil(datos: ActualizarPerfilEntrada): Promise<UsuarioDetalle> {
    const respuesta = await api.put<UsuarioDetalle>('/usuarios/perfil', datos);
    return respuesta.data;
  },

  async listar(rol?: string, organizacionId?: string): Promise<UsuarioDetalle[]> {
    const params: Record<string, string> = {};
    if (rol && rol !== 'TODOS') params.rol = rol;
    if (organizacionId && organizacionId !== 'TODAS') params.organizacionId = organizacionId;

    const respuesta = await api.get<UsuarioDetalle[]>('/usuarios', { params });
    return respuesta.data;
  },

  async obtenerPorId(id: string): Promise<UsuarioDetalle> {
    const respuesta = await api.get<UsuarioDetalle>(`/usuarios/${id}`);
    return respuesta.data;
  },

  async crear(datos: CrearUsuarioEntrada): Promise<UsuarioDetalle> {
    const respuesta = await api.post<UsuarioDetalle>('/usuarios', datos);
    return respuesta.data;
  },

  async actualizar(id: string, datos: Partial<CrearUsuarioEntrada> & { activo?: boolean }): Promise<UsuarioDetalle> {
    const respuesta = await api.put<UsuarioDetalle>(`/usuarios/${id}`, datos);
    return respuesta.data;
  },

  async cambiarRol(id: string, rol: string): Promise<UsuarioDetalle> {
    const respuesta = await api.patch<UsuarioDetalle>(`/usuarios/${id}/rol`, { rol });
    return respuesta.data;
  },

  async cambiarEstadoActivo(id: string, activo: boolean): Promise<UsuarioDetalle> {
    const respuesta = await api.patch<UsuarioDetalle>(`/usuarios/${id}/activo`, { activo });
    return respuesta.data;
  },

  async eliminar(id: string): Promise<{ mensaje: string; id: string }> {
    const respuesta = await api.delete<{ mensaje: string; id: string }>(`/usuarios/${id}`);
    return respuesta.data;
  },
};
