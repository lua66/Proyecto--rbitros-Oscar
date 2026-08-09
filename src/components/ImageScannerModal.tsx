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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Escanear Planilla o Foto con IA
              </h2>
              <p className="text-xs text-slate-400">
                Sube una foto de tu planilla manuscrita o Excel para extraer automáticamente las solicitudes de revisión.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* File Upload Zone */}
          {!selectedImage && (
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all">
              <Upload className="w-10 h-10 text-amber-400 mb-3" />
              <span className="text-sm font-bold text-slate-200">
                Haz clic para subir o arrastra una imagen aquí
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Soporta archivos PNG, JPG, JPEG o capturas de pantalla de planillas
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
              <div className="relative max-h-60 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex justify-center">
                <img src={selectedImage} alt="Planilla subida" className="object-contain max-h-60" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  title="Cambiar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-6 space-y-2">
                  <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-200">Extrayendo datos de la planilla con Gemini AI...</p>
                </div>
              ) : (
                <button
                  onClick={processImageWithAI}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
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
                  <CheckCircle className="w-4 h-4" /> Se extrajeron {parsedRows.length} fila(s) detectadas
                </h3>
                <button
                  onClick={() => setParsedRows(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Volver a intentar
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 p-2">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Juego N°</th>
                      <th className="p-2">Entrenador</th>
                      <th className="p-2">Jugada Desafiada</th>
                      <th className="p-2">Desafío</th>
                      <th className="p-2">Árbitros</th>
                      <th className="p-2">Arbitraje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{r.gameNumber || '-'}</td>
                        <td className="p-2">{r.coachName || '-'}</td>
                        <td className="p-2">{r.challengedPlay || '-'}</td>
                        <td className="p-2 font-bold text-amber-400">{r.coachResult || 'GANA'}</td>
                        <td className="p-2">{r.referees || '-'}</td>
                        <td className="p-2 font-bold text-blue-400">{r.refereeDecision || 'REVOCA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmImport}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" /> Importar {parsedRows.length} Registros a la Planilla Principal
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
