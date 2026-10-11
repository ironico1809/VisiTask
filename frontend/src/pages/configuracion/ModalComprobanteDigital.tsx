import { X, Printer, ShieldCheck, AlertTriangle, RefreshCw, QrCode, FileCheck2 } from 'lucide-react';
import type { ComprobanteDigitalItem } from '../../types/suscripcion.tipos.js';

interface PropiedadesModalComprobante {
  abierto: boolean;
  alCerrar: () => void;
  comprobante: ComprobanteDigitalItem | null;
  alReintentar?: (numeroFactura: string) => Promise<void>;
}

export const ModalComprobanteDigital: React.FC<PropiedadesModalComprobante> = ({
  abierto,
  alCerrar,
  comprobante,
  alReintentar,
}) => {
  if (!abierto || !comprobante) return null;

  const esPagada = comprobante.estado === 'PAID';
  const esFallida = comprobante.estado === 'FAILED';

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor-plan max-w-[620px]">
        {/* Cabecera del Comprobante */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${esPagada ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {esPagada ? <FileCheck2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque'] flex items-center gap-2">
                <span>Comprobante Digital de Pago</span>
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                    esPagada
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {esPagada ? 'Pagada / Emitida' : 'Rechazada / En Reintento'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">Factura: {comprobante.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Comprobante Fiscal */}
        <div className="p-6 space-y-5 text-slate-800 print:p-0">
          
          {/* Alerta de Error si fue fallido */}
          {esFallida && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Cobro Rechazado por la Entidad Bancaria</span>
              </div>
              <p>{comprobante.mensajeError || 'Fondos insuficientes o tarjeta denegada.'}</p>
              {comprobante.proximoReintento && (
                <p className="text-rose-700 font-medium pt-1">
                  Reintento automático programado para: <strong>{new Date(comprobante.proximoReintento).toLocaleString()}</strong>
                </p>
              )}
            </div>
          )}

          {/* Encabezado Emisor / Cliente */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-xs">
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500 font-bold">Emisor del Servicio</p>
              <p className="font-bold text-slate-900 font-['Bricolage_Grotesque'] text-sm mt-0.5">visitask ErgoCheck AI S.A.</p>
              <p className="text-slate-600">NIT Fiscal: 1029384756</p>
              <p className="text-slate-500 text-[11px]">Av. Tecnológica 1024, Edificio SST</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-mono text-slate-500 font-bold">Cliente / Organización</p>
              <p className="font-bold text-slate-900 font-['Bricolage_Grotesque'] text-sm mt-0.5">{comprobante.nombreOrganizacion}</p>
              <p className="text-slate-600">{comprobante.nitFiscal}</p>
              <p className="text-slate-500 text-[11px]">
                Emisión: {new Date(comprobante.fechaEmision).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tabla de Conceptos */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-mono text-slate-500 font-bold">Detalle del Concepto</p>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Descripción</th>
                    <th className="py-2 px-3 text-right">Cant.</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{comprobante.concepto}</p>
                      <p className="text-[11px] text-slate-500">Método: {comprobante.metodoPago}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">1</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">${comprobante.subtotal.toFixed(2)} USD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Desglose Financiero */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Neto:</span>
              <span className="font-mono">${comprobante.subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Impuesto al Valor Agregado (IVA 13%):</span>
              <span className="font-mono">${comprobante.impuestosIva.toFixed(2)} USD</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-sm">Total Pagado:</span>
              <span className="text-lg font-mono font-black text-[#0B1020]">
                ${comprobante.total.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Información de Seguridad Fiscal Digital */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certificación Digital de Validez Fiscal</span>
              </p>
              <p className="font-mono text-[11px] text-slate-700">
                Autorización: <strong className="text-slate-900">{comprobante.codigoAutorizacion}</strong>
              </p>
              <p className="font-mono text-[11px] text-slate-700">
                Código de Control: <strong className="text-slate-900">{comprobante.codigoControl}</strong>
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate max-w-sm" title={comprobante.hashFirmaDigital}>
                Firma SHA-256: {comprobante.hashFirmaDigital.slice(0, 32)}...
              </p>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 text-center flex-shrink-0">
              <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Verificación QR</span>
            </div>
          </div>

        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={alCerrar}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {esFallida && alReintentar && (
              <button
                type="button"
                onClick={() => alReintentar(comprobante.invoiceNumber)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar Cobro Ahora</span>
              </button>
            )}

            <button
              type="button"
              onClick={imprimir}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1020] text-[#C6F432] hover:bg-[#1a2342] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
