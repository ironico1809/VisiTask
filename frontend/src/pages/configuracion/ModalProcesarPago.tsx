import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type {
  SuscripcionActualItem,
  ComprobanteDigitalItem,
} from '../../types/suscripcion.tipos.js';
import { servicioSuscripciones } from '../../services/servicioSuscripciones.js';

interface PropiedadesModalProcesarPago {
  abierto: boolean;
  alCerrar: () => void;
  suscripcion: SuscripcionActualItem | null;
  montoPorCobrar?: number;
  alPagoCompletado: (comprobante: ComprobanteDigitalItem) => void;
}

export const ModalProcesarPago: React.FC<PropiedadesModalProcesarPago> = ({
  abierto,
  alCerrar,
  suscripcion,
  montoPorCobrar,
  alPagoCompletado,
}) => {
  const [metodo, setMetodo] = useState<'TARJETA' | 'QR_BANCARIO'>('TARJETA');
  const [numeroTarjeta, setNumeroTarjeta] = useState('4242 •••• •••• 4242');
  const [expiracion, setExpiracion] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [titular, setTitular] = useState('VISITASK ENTERPRISE S.A.');
  const [nitFiscal, setNitFiscal] = useState('NIT 1029384756');
  const [simularFallo, setSimularFallo] = useState(false);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) return null;

  const total = montoPorCobrar || suscripcion?.costoMensualEstimado || 590.0;
  const subtotal = Math.round((total / 1.13) * 100) / 100;
  const iva = Math.round((total - subtotal) * 100) / 100;

  const manejarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    setError(null);

    try {
      const resultado = await servicioSuscripciones.procesarPago({
        subscriptionId: suscripcion?.id || 'sub-visitask-01',
        monto: total,
        tipoMetodoPago: metodo,
        datosTarjeta: {
          numeroTarjeta: numeroTarjeta.replace(/\s+/g, ''),
          expiracion,
          cvc,
          titular,
        },
        nitFiscal,
        razonSocial: suscripcion?.nombreOrganizacion || 'Visitask Global Enterprise',
        simularFallo,
      });

      alPagoCompletado(resultado.comprobante);
      alCerrar();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al conectar con la pasarela bancaria.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor-plan max-w-[560px]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B1020] text-[#C6F432] rounded-xl shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Pasarela de Pago Segura
              </h3>
              <p className="text-xs text-slate-500">
                Procesamiento de cobro, validación y emisión de comprobante digital
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarPago} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selector de Método de Pago */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodo('TARJETA')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  metodo === 'TARJETA'
                    ? 'border-[#0B1020] bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${metodo === 'TARJETA' ? 'text-[#C6F432]' : 'text-slate-500'}`} />
                <div>
                  <p className="font-bold text-xs">Tarjeta de Crédito</p>
                  <p className={`text-[10px] ${metodo === 'TARJETA' ? 'text-slate-300' : 'text-slate-500'}`}>Visa / Mastercard</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('QR_BANCARIO')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  metodo === 'QR_BANCARIO'
                    ? 'border-[#0B1020] bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <QrCode className={`w-5 h-5 ${metodo === 'QR_BANCARIO' ? 'text-[#C6F432]' : 'text-slate-500'}`} />
                <div>
                  <p className="font-bold text-xs">QR Interoperable</p>
                  <p className={`text-[10px] ${metodo === 'QR_BANCARIO' ? 'text-slate-300' : 'text-slate-500'}`}>Pago móvil instantáneo</p>
                </div>
              </button>
            </div>
          </div>

          {/* Campos según Método */}
          {metodo === 'TARJETA' ? (
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Número de Tarjeta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={numeroTarjeta}
                    onChange={(e) => setNumeroTarjeta(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vencimiento (MM/AA)
                  </label>
                  <input
                    type="text"
                    value={expiracion}
                    onChange={(e) => setExpiracion(e.target.value)}
                    placeholder="12/28"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nombre del Titular de la Tarjeta
                </label>
                <input
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="NOMBRE APELLIDO"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-white text-center space-y-2">
              <QrCode className="w-24 h-24 text-slate-900 mx-auto" />
              <p className="text-xs font-bold text-slate-900">Escanea desde tu banca móvil para pagar</p>
              <p className="text-[11px] text-slate-500">
                Al confirmar la transferencia, el comprobante fiscal se emite de forma automática.
              </p>
            </div>
          )}

          {/* Datos Fiscales */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              NIT / RUC para Emisión de Comprobante Fiscal
            </label>
            <input
              type="text"
              value={nitFiscal}
              onChange={(e) => setNitFiscal(e.target.value)}
              placeholder="NIT 1029384756"
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
            />
          </div>

          {/* Simulación y Diagnóstico de Pasarela de Pagos */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">Simulación de Validación Pasarela:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simularFallo}
                  onChange={(e) => setSimularFallo(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-600 rounded"
                />
                <span className="text-[11px] text-amber-800 font-semibold">Simular Cobro Rechazado</span>
              </label>
            </div>
            <p className="text-[11px] text-amber-700">
              {simularFallo
                ? 'El banco rechazará el cobro (Error 051) para validar el estado "PAST_DUE", el contador de reintentos y la política de recuperación.'
                : 'El cobro se procesará exitosamente emitiendo el comprobante fiscal con hash criptográfico.'}
            </p>
          </div>

          {/* Resumen de Cobro */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Neto:</span>
              <span className="font-mono">${subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (13%):</span>
              <span className="font-mono">${iva.toFixed(2)} USD</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-sm">Total a Cobrar:</span>
              <span className="text-xl font-mono font-black text-slate-900">${total.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={alCerrar}
              disabled={procesando}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={procesando}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1020] text-[#C6F432] hover:bg-[#1a2342] transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {procesando ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validando con Pasarela...</span>
                </>
              ) : (
                <>
                  <span>Pagar ${total.toFixed(2)} USD y Emitir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
