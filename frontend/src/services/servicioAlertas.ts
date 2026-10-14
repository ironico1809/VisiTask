import { api } from './api.js';
import type {
  ConfiguracionAlertas,
  AlertaItem,
  DispararAlertaPeticion,
  RespuestaDisparoAlerta,
} from '../types/alerta.tipos.js';

export const servicioAlertas = {
  /**
   * Obtiene la configuración actual de alertas ergonómicas y canales push
   */
  async obtenerConfiguracion(): Promise<ConfiguracionAlertas> {
    try {
      const respuesta = await api.get<ConfiguracionAlertas>('/alertas/configuracion');
      return respuesta.data;
    } catch {
      // Fallback local en caso de desconexión
      return {
        umbralRulaCritico: 5,
        tiempoSostenidoSegundos: 60,
        umbralFatigaPorcentaje: 75,
        frecuenciaMinutos: 5,
        pausaActivaMinutos: 20,
        canales: {
          visual: true,
          sonoro: true,
          volumenSonido: 80,
          tonoSonido: 'chime',
          pushMovil: true,
        },
        tokenDispositivoMovil: 'fcm-apk-demo-android-2026',
      };
    }
  },

  /**
   * Guarda y actualiza la configuración de límites y frecuencias (Rol Administrador / SST)
   */
  async actualizarConfiguracion(
    configuracion: ConfiguracionAlertas,
  ): Promise<{ exito: boolean; mensaje: string; configuracion: ConfiguracionAlertas }> {
    const respuesta = await api.put<{ exito: boolean; mensaje: string; configuracion: ConfiguracionAlertas }>(
      '/alertas/configuracion',
      configuracion,
    );
    return respuesta.data;
  },

  /**
   * Dispara y registra una alerta postural o de fatiga en la sesión activa
   */
  async dispararAlerta(peticion: DispararAlertaPeticion): Promise<RespuestaDisparoAlerta> {
    try {
      const respuesta = await api.post<RespuestaDisparoAlerta>('/alertas/disparar', peticion);
      return respuesta.data;
    } catch {
      // Fallback local simulado
      return {
        alerta: {
          id: `alt-local-${Date.now()}`,
          usuarioId: 'usr-local',
          tipo: peticion.tipo,
          nivel: peticion.nivel,
          mensaje: peticion.mensaje,
          puntajeRula: peticion.puntajeRula,
          tiempoSostenidoSegundos: peticion.tiempoSostenidoSegundos,
          isSentToMobile: peticion.enviarPushMovil ?? true,
          isDismissed: false,
          createdAt: new Date().toISOString(),
        },
        pushEnviado: peticion.enviarPushMovil ?? true,
        canalesActivados: {
          visual: true,
          sonoro: true,
          pushMovil: true,
        },
        recomendacionErgonomica:
          'Ajusta la altura del monitor a tus ojos y apoya la espalda completamente en el respaldar.',
      };
    }
  },

  /**
   * Lista el historial reciente de alertas disparadas
   */
  async listarAlertas(limite: number = 20): Promise<AlertaItem[]> {
    try {
      const respuesta = await api.get<AlertaItem[]>('/alertas', { params: { limite } });
      return respuesta.data;
    } catch {
      return [];
    }
  },

  /**
   * Marca una alerta como atendida / descartada
   */
  async descartarAlerta(alertaId: string, motivo?: string): Promise<{ exito: boolean; alertaId: string }> {
    try {
      const respuesta = await api.put<{ exito: boolean; alertaId: string }>(`/alertas/${alertaId}/descartar`, {
        motivo,
      });
      return respuesta.data;
    } catch {
      return { exito: true, alertaId };
    }
  },

  /**
   * Envía una notificación push de prueba al APK móvil registrado
   */
  async probarPush(tokenDispositivo?: string): Promise<{ exito: boolean; mensaje: string; payloadPrueba: any }> {
    const respuesta = await api.post<{ exito: boolean; mensaje: string; payloadPrueba: any }>('/alertas/probar-push', {
      tokenDispositivo,
    });
    return respuesta.data;
  },
};
