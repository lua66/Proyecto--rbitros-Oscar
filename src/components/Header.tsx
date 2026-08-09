import React, { useState } from 'react';
import logoImg from '../assets/images/basketball_irs_favicon_1786309760867.jpg';
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
  const [imgError, setImgError] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col gap-3">
          
          {/* Top Row: Logo, Title & View Switcher */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-inner shrink-0 bg-slate-950 flex items-center justify-center">
                {!imgError ? (
                  <img
                    id="header-app-logo"
                    src={logoImg}
                    alt="Logo IRS"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="p-2 text-amber-400">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-100 truncate">
                    Revisiones de Árbitros e IRS
                  </h1>
                  <span className="hidden xs:inline-block bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    FIBA / IRS
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-slate-400 truncate mt-0.5">
                  Control de Challenges ({totalRecords} registros)
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center shrink-0">
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation min-h-[36px] ${
                  activeView === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Planilla</span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation min-h-[36px] ${
                  activeView === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Estadísticas</span>
              </button>
            </div>

          </div>

          {/* Bottom Row: Action Toolbar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Add Record Primary Button */}
              <button
                onClick={onOpenNewRecord}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 touch-manipulation min-h-[38px]"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Nuevo Registro</span>
              </button>

              {/* AI Image Scan */}
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors touch-manipulation min-h-[38px]"
                title="Escanear foto de planilla manuscrita con IA"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Escanear Foto</span>
              </button>

              {/* AI Executive Report */}
              <button
                onClick={onOpenAIReport}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900 active:bg-indigo-950 text-indigo-200 border border-indigo-700/50 rounded-xl text-xs font-medium transition-colors touch-manipulation min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Informe IA</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Export CSV */}
              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors touch-manipulation min-h-[38px]"
                title="Exportar a CSV / Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {/* Reset Sample Data */}
              <button
                onClick={onResetSampleData}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl transition-colors touch-manipulation min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Restaurar datos de ejemplo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
