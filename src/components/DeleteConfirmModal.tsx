import React from 'react';
import { ReviewRecord } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  record: ReviewRecord | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Confirmar Eliminación</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            ¿Está seguro de que desea eliminar permanentemente este registro de revisión?
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span>{record.gameNumber}</span>
              <span className="text-slate-400 font-mono font-normal">{record.date}</span>
            </div>
            <div className="text-slate-200 font-medium">
              Entrenador: <strong className="text-white">{record.coachName}</strong> {record.coachTeam ? `(${record.coachTeam})` : ''}
            </div>
            <div className="text-slate-400">
              Jugada: <span className="text-slate-300">{record.challengedPlay}</span>
            </div>
            <div className="text-slate-400">
              Árbitros: <span className="text-slate-300">{record.referees}</span>
            </div>
          </div>

          <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Esta acción no se puede deshacer.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(record.id);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Registro
          </button>
        </div>

      </div>
    </div>
  );
};
