export type NivelAlerta = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TipoAlerta =
  | 'POSTURAL_RISK_PROLONGED'
  | 'STATIC_OVERLOAD'
  | 'FATIGUE_ACCUMULATED'
  | 'EYE_BREAK_20_20_20'
  | 'ANOMALY_BEHAVIOR';

export type TonoSonido = 'chime' | 'alerta' | 'campana' | 'pulso';

export interface CanalesNotificacion {
  visual: boolean;
  sonoro: boolean;
  volumenSonido: number; // 0 a 100
  tonoSonido: TonoSonido;
  pushMovil: boolean;
}

export interface ConfiguracionAlertas {
  umbralRulaCritico: number; // Por defecto 5 (RULA >= 5 sostenido)
  tiempoSostenidoSegundos: number; // Por defecto 60 segundos
  umbralFatigaPorcentaje: number; // Por defecto 75%
  frecuenciaMinutos: number; // Frecuencia mínima entre alertas repetidas (ej. 5 min)
  pausaActivaMinutos: number; // Intervalo de pausa activa regla 20-20-20 (20 min)
  canales: CanalesNotificacion;
  tokenDispositivoMovil?: string; // Token FCM del APK móvil
}

export interface AlertaItem {
  id: string;
  usuarioId: string;
  sessionId?: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  mensaje: string;
  puntajeRula?: number;
  tiempoSostenidoSegundos?: number;
  anguloCuello?: number;
  anguloTronco?: number;
  anguloHombros?: number;
  nivelFatiga?: number;
  isSentToMobile: boolean;
  isDismissed: boolean;
  createdAt: string | Date;
  dismissedAt?: string | Date;
  motivoDescarte?: string;
  pushPayload?: any;
}

export interface DispararAlertaPeticion {
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  mensaje: string;
  puntajeRula?: number;
  tiempoSostenidoSegundos?: number;
  anguloCuello?: number;
  anguloTronco?: number;
  anguloHombros?: number;
  nivelFatiga?: number;
  sessionId?: string;
  enviarPushMovil?: boolean;
}

export interface RespuestaDisparoAlerta {
  alerta: AlertaItem;
  pushEnviado: boolean;
  canalesActivados: {
    visual: boolean;
    sonoro: boolean;
    pushMovil: boolean;
  };
  recomendacionErgonomica: string;
}
