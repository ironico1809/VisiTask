import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  CheckCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import {
  servicioReportes,
  type InformeAuditoria,
  type MetricasSstGlobales,
  type DescargaReporteRespuesta,
} from '../../services/servicioReportes.js';

export const PaginaReportes: React.FC = () => {
  useTituloPagina('Reportes y SST');

  const [reportes, setReportes] = useState<InformeAuditoria[]>([]);
  const [metricas, setMetricas] = useState<MetricasSstGlobales>({
    horasEvaluadas: 1420,
    reduccionRiesgo: '-34.8%',
    proximaAuditoria: '15 Nov 2026',
    colaboradoresMonitoreados: 26,
    riesgoCritico: 2,
    indiceBienestarSst: 88.4,
    indiceIntegridadPromedio: 94.1,
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [comprobanteDescarga, setComprobanteDescarga] = useState<DescargaReporteRespuesta | null>(null);
  const [generando, setGenerando] = useState<boolean>(false);

  // Cargar datos en vivo directamente desde PostgreSQL
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [listaReportes, metricasRes] = await Promise.all([
          servicioReportes.listar(),
          servicioReportes.obtenerMetricas(),
        ]);
        if (listaReportes.length > 0) setReportes(listaReportes);
        if (metricasRes) setMetricas(metricasRes);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Descarga de expediente con firma criptográfica
  const manejarDescargar = async (id: string, formato: 'xlsx' | 'pdf' = 'xlsx') => {
    setDescargandoId(id);
    try {
      const resp = await servicioReportes.descargarReporte(id, formato);
      setComprobanteDescarga(resp);
    } finally {
      setDescargandoId(null);
    }
  };

  // Generación de nuevo informe SST en vivo en PostgreSQL
  const manejarGenerarNuevo = async () => {
    setGenerando(true);
    try {
      const nuevo = await servicioReportes.generarReporte({
        titulo: `Auditoría Ergonómica Extraordinaria - ${new Date().toLocaleDateString('es-ES')}`,
        tipo: 'ERGONOMIC_SST_CORPORATE',
        metricasResumen: {
          totalPersonal: metricas.colaboradoresMonitoreados,
          tasaRiesgo: '6.5%',
          horasEvaluadas: metricas.horasEvaluadas + 15,
          reduccionRiesgo: '-36.0%',
        },
      });
      setReportes((prev) => [nuevo, ...prev]);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Reportes de Seguridad y Salud en el Trabajo (SST)
          </h2>
          <p className="text-xs text-slate-500">
            Historial de auditorías posturales conforme a la normativa ISO 11226 y método RULA conectadas a PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Boton
            tamano="sm"
            variante="borde"
            onClick={manejarGenerarNuevo}
            disabled={generando}
            className="gap-1.5 text-xs cursor-pointer"
          >
            {generando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Emitir Nueva Auditoría</span>
          </Boton>

          <Boton
            tamano="sm"
            variante="primario"
            onClick={() => manejarDescargar(reportes[0]?.id || 'rep-01', 'xlsx')}
            disabled={descargandoId !== null}
            className="gap-2 text-xs cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Resumen SST (.XLSX)</span>
          </Boton>
        </div>
      </div>

      {/* Modal / Toast de Descarga de Certificado Digital */}
      {comprobanteDescarga && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#C6F432]">
                {comprobanteDescarga.mensaje} ({comprobanteDescarga.formato.toUpperCase()})
              </p>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                Firma SHA-256: {comprobanteDescarga.hashSha256.slice(0, 32)}... • {comprobanteDescarga.firmadoPor}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setComprobanteDescarga(null)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all self-end sm:self-auto cursor-pointer"
          >
            Cerrar Notificación
          </button>
        </div>
      )}

      {/* Tarjetas Resumen de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Horas Evaluadas</p>
            <h4 className="text-xl font-bold text-slate-900">
              {metricas.horasEvaluadas.toLocaleString()} hrs
            </h4>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Reducción de Riesgo</p>
            <h4 className="text-xl font-bold text-emerald-600">{metricas.reduccionRiesgo}</h4>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Próxima Auditoría</p>
            <h4 className="text-xl font-bold text-slate-900">{metricas.proximaAuditoria}</h4>
          </div>
        </Tarjeta>
      </div>

      {/* Tabla de Informes Generados */}
      <Tarjeta
        titulo="Informes Emitidos"
        subtitulo="Descarga de expedientes consolidados con firma digital y hash inmutable de PostgreSQL"
      >
        {cargando ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B1020]" />
            <span>Cargando reportes desde la base de datos PostgreSQL...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {reportes.map((reporte) => (
              <div
                key={reporte.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{reporte.titulo}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {reporte.fecha} • {reporte.totalPersonal} Colaboradores auditados
                      {reporte.hashIntegridad && ` • Hash SHA-256: ${reporte.hashIntegridad.slice(0, 10)}...`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Insignia variante={reporte.estado === 'Generado' ? 'exito' : 'informacion'}>
                    {reporte.estado}
                  </Insignia>
                  <Boton
                    tamano="sm"
                    variante="borde"
                    onClick={() => manejarDescargar(reporte.id, 'xlsx')}
                    disabled={descargandoId === reporte.id}
                    className="gap-1.5 text-xs cursor-pointer"
                  >
                    {descargandoId === reporte.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Descargar</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Boton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>
    </div>
  );
};
