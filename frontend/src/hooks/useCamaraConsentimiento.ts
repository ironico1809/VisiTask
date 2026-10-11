import { useState, useRef, useEffect, useCallback } from 'react';

export type EstadoCamara =
  | 'inactivo'
  | 'solicitando'
  | 'activo'
  | 'denegado'
  | 'no_disponible'
  | 'ocupada';

export const useCamaraConsentimiento = () => {
  const [estado, setEstado] = useState<EstadoCamara>('inactivo');
  const [flujo, setFlujo] = useState<MediaStream | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Detener la cámara limpiamente
  const detenerCamara = useCallback(() => {
    if (flujo) {
      flujo.getTracks().forEach((track) => track.stop());
      setFlujo(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setEstado('inactivo');
  }, [flujo]);

  // Solicitar permiso técnico del navegador y conectar el video
  const solicitarPermisoYActivar = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setEstado('no_disponible');
      setErrorMensaje('Tu navegador o dispositivo no soporta la captura de video WebRTC.');
      return false;
    }

    try {
      setEstado('solicitando');
      setErrorMensaje(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      setFlujo(stream);
      setEstado('activo');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setEstado('denegado');
        setErrorMensaje(
          'Permiso denegado por el usuario en el navegador. Haz clic en el ícono de candado o cámara en la barra de direcciones para habilitarlo.',
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setEstado('no_disponible');
        setErrorMensaje('No se detectó ninguna cámara web conectada a este equipo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setEstado('ocupada');
        setErrorMensaje('La cámara web está siendo utilizada por otra aplicación (Zoom, Teams, etc.). Ciérrala para continuar.');
      } else {
        setEstado('denegado');
        setErrorMensaje(`No fue posible acceder a la cámara: ${err.message || 'Error desconocido'}`);
      }
      return false;
    }
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (flujo) {
        flujo.getTracks().forEach((track) => track.stop());
      }
    };
  }, [flujo]);

  return {
    estado,
    flujo,
    errorMensaje,
    videoRef,
    solicitarPermisoYActivar,
    detenerCamara,
  };
};
