import React, { useState } from 'react';
import { ReviewRecord } from '../types';
import { Sparkles, X, Copy, Download, RefreshCw, Check, FileText } from 'lucide-react';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ReviewRecord[];
}

export const AIReportModal: React.FC<AIReportModalProps> = ({ isOpen, onClose, records }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || 'Error al generar el informe con la Inteligencia Artificial.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión con el servidor de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Informe_Arbitral_IA_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-t-2xl sm:rounded-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl my-0 sm:my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Informe de Inteligencia Arbitral IA
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Análisis técnico automatizado con Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {!report && !loading && !error && (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-1 px-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">Generar Dictamen Analítico</h3>
                <p className="text-xs text-slate-400">
                  La IA examinará los {records.length} registros cargados para emitir un desglose sobre la consistencia del arbitraje, tasa de acierto de los entrenadores y áreas de mejora.
                </p>
              </div>
              <button
                onClick={generateReport}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2 touch-manipulation min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generar Informe Técnico Ahora</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-10 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">Analizando revisiones y decisiones arbitrales...</p>
              <p className="text-xs text-slate-500">Gemini AI está procesando el historial de jugadas e IRS.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center space-y-2">
              <p className="font-semibold">{error}</p>
              <button
                onClick={generateReport}
                className="px-3 py-2 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold touch-manipulation min-h-[36px]"
              >
                Reintentar
              </button>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-4 max-h-[50vh] sm:max-h-96 overflow-y-auto text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {report}
              </div>

              {/* Action bar for generated report */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={generateReport}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 touch-manipulation min-h-[36px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerar
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 touch-manipulation min-h-[38px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow touch-manipulation min-h-[38px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
