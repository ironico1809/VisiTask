import React from 'react';
import { FileSpreadsheet, Download, Calendar, BarChart3, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';

export interface InformeAuditoria {
  id: string;
  titulo: string;
  fecha: string;
  totalPersonal: number;
  tasaRiesgo: string;
  estado: 'Generado' | 'Archivado' | 'Completado';
}

export const PaginaReportes: React.FC = () => {
  useTituloPagina('Reportes y SST');

  const reportesSimulados: InformeAuditoria[] = [
    {
      id: 'rep-01',
      titulo: 'Auditoría Mensual Ergonómica (RULA/REBA)',
      fecha: 'Octubre 2026',
      totalPersonal: 26,
      tasaRiesgo: '7.6%',
      estado: 'Generado',
    },
    {
      id: 'rep-02',
      titulo: 'Informe de Pausas Activas y Fatiga Acumulada',
      fecha: 'Septiembre 2026',
      totalPersonal: 24,
      tasaRiesgo: '11.2%',
      estado: 'Archivado',
    },
    {
      id: 'rep-03',
      titulo: 'Telemetría de Integridad en Evaluaciones Técnicas',
      fecha: 'Septiembre 2026',
      totalPersonal: 18,
      tasaRiesgo: '0 desvíos',
      estado: 'Completado',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reportes de Seguridad y Salud en el Trabajo (SST)</h2>
          <p className="text-xs text-slate-500">Historial de auditorías posturales conforme a la normativa ISO 11226 y método RULA</p>
        </div>

        <Boton tamano="sm" variante="primario" className="gap-2 text-xs">
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Resumen SST (.XLSX)</span>
        </Boton>
      </div>

      {/* Tarjetas Resumen de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Horas Evaluadas</p>
            <h4 className="text-xl font-bold text-slate-900">1,420 hrs</h4>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Reducción de Riesgo</p>
            <h4 className="text-xl font-bold text-emerald-600">-34.8%</h4>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-slate-500 uppercase">Próxima Auditoría</p>
            <h4 className="text-xl font-bold text-slate-900">15 Nov 2026</h4>
          </div>
        </Tarjeta>
      </div>

      {/* Tabla de Informes Generados */}
      <Tarjeta titulo="Informes Emitidos" subtitulo="Descarga de expedientes consolidados con firma digital y hash inmutable">
        <div className="divide-y divide-slate-100 text-xs">
          {reportesSimulados.map((reporte) => (
            <div key={reporte.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{reporte.titulo}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {reporte.fecha} • {reporte.totalPersonal} Colaboradores auditados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Insignia variante={reporte.estado === 'Generado' ? 'exito' : 'informacion'}>
                  {reporte.estado}
                </Insignia>
                <Boton tamano="sm" variante="borde" className="gap-1.5 text-xs">
                  <span>Descargar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Boton>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>
    </div>
  );
};

export const ReportsPage = PaginaReportes;
