import { api } from './api.js';

export interface DetalleConsentimiento {
  id: string;
  usuarioId: string;
  tipo: string;
  version: string;
  estaAceptado: boolean;
  direccionIp?: string;
  userAgent?: string;
  aceptadoEn?: string;
}

export interface EstadoConsentimientoRespuesta {
  tieneConsentimiento: boolean;
  aceptaCamara: boolean;
  aceptaTelemetria: boolean;
  version: string;
  fechaAceptacion?: string;
  detalles: DetalleConsentimiento[];
}

export const servicioConsentimiento = {
  async obtenerEstado(): Promise<EstadoConsentimientoRespuesta> {
    const respuesta = await api.get<EstadoConsentimientoRespuesta>('/consentimiento/estado');
    return respuesta.data;
  },

  async firmar(tipos?: string[], version?: string): Promise<{ exito: boolean; mensaje: string; fechaAceptacion: string }> {
    const respuesta = await api.post('/consentimiento/firmar', { tipos, version });
    return respuesta.data;
  },

  async revocar(): Promise<{ exito: boolean; mensaje: string }> {
    const respuesta = await api.post('/consentimiento/revocar');
    return respuesta.data;
  },
};
