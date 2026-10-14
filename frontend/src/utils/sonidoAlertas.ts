import type { TonoSonido } from '../types/alerta.tipos.js';

class GeneradorSonidoErgonomico {
  private audioCtx: AudioContext | null = null;

  private inicializarContexto(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Reproduce un tono de alerta ergonómica en el navegador
   * @param tono 'chime' | 'alerta' | 'campana' | 'pulso'
   * @param volumen Nivel de 0 a 100
   */
  public reproducir(tono: TonoSonido = 'chime', volumen: number = 80): void {
    const ctx = this.inicializarContexto();
    if (!ctx) return;

    const gananciaBase = Math.max(0.01, Math.min(1, (volumen / 100) * 0.35));
    const now = ctx.currentTime;

    try {
      switch (tono) {
        case 'chime': {
          // Acorde suave de 2 notas armónicas ascendentes (Do5 - Mi5 / 523Hz - 659Hz)
          this.reproducirNota(ctx, 523.25, now, 0.4, gananciaBase, 'sine');
          this.reproducirNota(ctx, 659.25, now + 0.15, 0.5, gananciaBase * 0.9, 'sine');
          break;
        }

        case 'alerta': {
          // Tono pulsante de advertencia RULA crítico (dos pulsos rápidos 440Hz -> 880Hz)
          this.reproducirNota(ctx, 440, now, 0.12, gananciaBase * 1.1, 'triangle');
          this.reproducirNota(ctx, 880, now + 0.14, 0.25, gananciaBase * 1.2, 'triangle');
          break;
        }

        case 'campana': {
          // Campana tibetana suave para pausas activas (587Hz con decaimiento armónico)
          this.reproducirCampana(ctx, 587.33, now, 1.2, gananciaBase);
          break;
        }

        case 'pulso': {
          // Pulso grave y suave de fatiga acumulada
          this.reproducirNota(ctx, 220, now, 0.3, gananciaBase, 'sine');
          this.reproducirNota(ctx, 330, now + 0.2, 0.4, gananciaBase * 0.8, 'sine');
          break;
        }

        default:
          this.reproducirNota(ctx, 523.25, now, 0.4, gananciaBase, 'sine');
      }
    } catch (err) {
      console.warn('Error al reproducir audio ergonómico:', err);
    }
  }

  private reproducirNota(
    ctx: AudioContext,
    frecuencia: number,
    inicio: number,
    duracion: number,
    volumen: number,
    tipo: OscillatorType,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tipo;
    osc.frequency.setValueAtTime(frecuencia, inicio);

    gain.gain.setValueAtTime(0.001, inicio);
    gain.gain.exponentialRampToValueAtTime(volumen, inicio + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(inicio);
    osc.stop(inicio + duracion);
  }

  private reproducirCampana(
    ctx: AudioContext,
    frecuencia: number,
    inicio: number,
    duracion: number,
    volumen: number,
  ): void {
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frecuencia, inicio);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(frecuencia * 2.01, inicio);

    gain.gain.setValueAtTime(0.001, inicio);
    gain.gain.exponentialRampToValueAtTime(volumen, inicio + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start(inicio);
    oscHarmonic.start(inicio);
    osc.stop(inicio + duracion);
    oscHarmonic.stop(inicio + duracion);
  }
}

export const sonidoAlertas = new GeneradorSonidoErgonomico();
