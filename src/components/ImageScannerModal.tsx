import React, { useState } from 'react';
import { ReviewRecord } from '../types';
import { Camera, Upload, X, CheckCircle, RefreshCw, AlertCircle, Plus } from 'lucide-react';

interface ImageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: ReviewRecord[]) => void;
}

export const ImageScannerModal: React.FC<ImageScannerModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Partial<ReviewRecord>[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setParsedRows(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const processImageWithAI = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const mimeType = selectedImage.split(';')[0].replace('data:', '');
      const res = await fetch('/api/parse-sheet-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setParsedRows(data.records);
      } else {
        setError(data.error || 'No se pudieron extraer datos de la planilla. Verifique que la imagen sea legible.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedRows || parsedRows.length === 0) return;

    const formattedRecords: ReviewRecord[] = parsedRows.map((row, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      gameNumber: row.gameNumber || 'JUEGO N° 01',
      date: row.date || new Date().toISOString().slice(0, 10),
      teams: row.teams || undefined,
      coachName: row.coachName || 'Sin Nombre',
      coachTeam: row.coachTeam || undefined,
      challengedPlay: row.challengedPlay || 'Revisión IRS',
      coachResult: row.coachResult === 'GANA' || row.coachResult === 'PIERDE' ? row.coachResult : 'GANA',
      referees: row.referees || 'Árbitro No Especificado',
      assistedIRS: row.assistedIRS ?? true,
      refereeDecision: row.refereeDecision === 'MANTIENE' || row.refereeDecision === 'REVOCA' ? row.refereeDecision : 'REVOCA',
      notes: row.notes || 'Importado vía escáner de foto IA',
      createdAt: Date.now() + idx,
    }));

    onImportRecords(formattedRecords);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl my-0 sm:my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Escanear Planilla o Foto con IA
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Extrae solicitudes de revisión desde una foto o captura.
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          
          {/* File Upload Zone */}
          {!selectedImage && (
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all touch-manipulation min-h-[160px]">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm font-bold text-slate-200 text-center">
                Haz clic para subir o tomar foto de planilla
              </span>
              <span className="text-[11px] text-slate-500 mt-1 text-center">
                Soporta PNG, JPG, JPEG o fotos de cámara
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Image Preview & Scanner Trigger */}
          {selectedImage && !parsedRows && (
            <div className="space-y-4">
              <div className="relative max-h-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex justify-center">
                <img src={selectedImage} alt="Planilla subida" className="object-contain max-h-56" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-slate-900/80 text-white rounded-lg hover:bg-rose-600 transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Cambiar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-6 space-y-2">
                  <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-200">Extrayendo datos con Gemini AI...</p>
                </div>
              ) : (
                <button
                  onClick={processImageWithAI}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg touch-manipulation min-h-[44px]"
                >
                  <Camera className="w-4 h-4" /> Procesar Imagen con IA
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Results Preview Table */}
          {parsedRows && parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Se extrajeron {parsedRows.length} fila(s)
                </h3>
                <button
                  onClick={() => setParsedRows(null)}
                  className="text-xs text-slate-400 hover:text-white underline touch-manipulation min-h-[32px] px-2"
                >
                  Reintentar
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 p-2">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Juego</th>
                      <th className="p-2">Coach</th>
                      <th className="p-2">Jugada</th>
                      <th className="p-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{r.gameNumber || '-'}</td>
                        <td className="p-2">{r.coachName || '-'}</td>
                        <td className="p-2">{r.challengedPlay || '-'}</td>
                        <td className="p-2 font-bold text-amber-400">{r.coachResult || 'GANA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmImport}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg touch-manipulation min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> Importar {parsedRows.length} Registros
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
