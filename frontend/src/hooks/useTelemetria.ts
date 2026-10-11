import { useState, useEffect } from 'react';

export interface DatosTelemetria {
  puntajeRula: number;
  estadoRula: 'Óptimo' | 'Atención' | 'Riesgo Alto';
  anguloCervical: number;
  anguloTronco: number;
  segundosEstaticos: number;
  tiempoSesionFormateado: string;
  puntajeEnfoque: number;
  alertaPostura: boolean;

  // Compatibilidad
  rulaScore?: number;
  rulaStatus?: 'Óptimo' | 'Atención' | 'Riesgo Alto';
  cervicalAngle?: number;
  trunkAngle?: number;
  staticSeconds?: number;
  sessionTimeFormatted?: string;
  focusScore?: number;
  postureAlert?: boolean;
}

export function useTelemetria(segundosIniciales = 2 * 3600 + 14 * 60 + 9) {
  const [segundos, setSegundos] = useState(segundosIniciales);
  const [puntajeRula, setPuntajeRula] = useState(2);
  const [anguloCervical, setAnguloCervical] = useState(12);
  const [anguloTronco, setAnguloTronco] = useState(4);
  const [segundosEstaticos, setSegundosEstaticos] = useState(48);
  const [puntajeEnfoque, setPuntajeEnfoque] = useState(94);

  useEffect(() => {
    const temporizador = setInterval(() => {
      setSegundos((prev) => prev + 1);
      setSegundosEstaticos((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(temporizador);
  }, []);

  const formatearTiempo = (totalSeg: number) => {
    const h = String(Math.floor(totalSeg / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeg % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const estadoRula: DatosTelemetria['estadoRula'] =
    puntajeRula <= 2 ? 'Óptimo' : puntajeRula <= 4 ? 'Atención' : 'Riesgo Alto';

  const tiempoFormateado = formatearTiempo(segundos);

  return {
    puntajeRula,
    estadoRula,
    anguloCervical,
    anguloTronco,
    segundosEstaticos,
    tiempoSesionFormateado: tiempoFormateado,
    puntajeEnfoque,
    alertaPostura: puntajeRula > 3,
    setPuntajeRula,
    setAnguloCervical,
    setAnguloTronco,
    setPuntajeEnfoque,

    // Compatibilidad inglés
    rulaScore: puntajeRula,
    rulaStatus: estadoRula,
    cervicalAngle: anguloCervical,
    trunkAngle: anguloTronco,
    staticSeconds: segundosEstaticos,
    sessionTimeFormatted: tiempoFormateado,
    focusScore: puntajeEnfoque,
    postureAlert: puntajeRula > 3,
    setRulaScore: setPuntajeRula,
    setCervicalAngle: setAnguloCervical,
    setTrunkAngle: setAnguloTronco,
    setFocusScore: setPuntajeEnfoque,
  };
}

export const useTelemetry = useTelemetria;
export type TelemetryData = DatosTelemetria;
