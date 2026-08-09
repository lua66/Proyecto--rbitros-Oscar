import React from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Camera, 
  BarChart3, 
  Table as TableIcon 
} from 'lucide-react';

interface HeaderProps {
  onOpenNewRecord: () => void;
  onResetSampleData: () => void;
  onExportCSV: () => void;
  onOpenAIReport: () => void;
  onOpenScanner: () => void;
  activeView: 'table' | 'analytics';
  setActiveView: (view: 'table' | 'analytics') => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewRecord,
  onResetSampleData,
  onExportCSV,
  onOpenAIReport,
  onOpenScanner,
  activeView,
  setActiveView,
  totalRecords,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-inner shrink-0 bg-slate-950 flex items-center justify-center">
              <img
                id="header-app-logo"
                src="/src/assets/images/basketball_irs_favicon_1786309760867.jpg"
                alt="Favicon Logo IRS"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                  Solicitudes de Revisiones de Coaches y Árbitros
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  IRS System
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Control de Coach's Challenge e Instant Replay System ({totalRecords} registros)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Switcher Tabs */}
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700/80 flex items-center mr-2">
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Planilla
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Estadísticas
              </button>
            </div>

            {/* AI Image Scan */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Escanear planilla manuscrita o foto con IA"
            >
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Escanear Foto</span>
            </button>

            {/* AI Executive Report */}
            <button
              onClick={onOpenAIReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/50 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Informe IA</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Exportar a CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Reset Sample Data */}
            <button
              onClick={onResetSampleData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg transition-colors"
              title="Cargar / Restaurar datos de ejemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Add Record Primary Button */}
            <button
              onClick={onOpenNewRecord}
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all active:scale-95 ml-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
