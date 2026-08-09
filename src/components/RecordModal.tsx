import React, { useState, useEffect } from 'react';
import { ReviewRecord, ChallengeResult, DecisionResult } from '../types';
import { COMMON_PLAY_TYPES } from '../data/sampleData';
import { X, Save, Check, Shield, User, AlertCircle, Calendar, Hash } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ReviewRecord) => void;
  initialData?: ReviewRecord | null;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [gameNumber, setGameNumber] = useState('JUEGO N° 01');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teams, setTeams] = useState('');

  // Coach Challenge fields
  const [coachName, setCoachName] = useState('');
  const [coachTeam, setCoachTeam] = useState('');
  const [challengedPlay, setChallengedPlay] = useState('');
  const [customPlay, setCustomPlay] = useState('');
  const [coachResult, setCoachResult] = useState<ChallengeResult>('GANA');

  // Referee IRS fields
  const [referees, setReferees] = useState('');
  const [assistedIRS, setAssistedIRS] = useState(true);
  const [refereeDecision, setRefereeDecision] = useState<DecisionResult>('REVOCA');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setGameNumber(initialData.gameNumber || '');
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setTeams(initialData.teams || '');
      setCoachName(initialData.coachName || '');
      setCoachTeam(initialData.coachTeam || '');
      
      if (COMMON_PLAY_TYPES.includes(initialData.challengedPlay)) {
        setChallengedPlay(initialData.challengedPlay);
        setCustomPlay('');
      } else {
        setChallengedPlay('OTRA');
        setCustomPlay(initialData.challengedPlay || '');
      }

      setCoachResult(initialData.coachResult || 'GANA');
      setReferees(initialData.referees || '');
      setAssistedIRS(initialData.assistedIRS ?? true);
      setRefereeDecision(initialData.refereeDecision || 'REVOCA');
      setNotes(initialData.notes || '');
    } else {
      // Reset defaults for new record
      setGameNumber('JUEGO N° 01');
      setDate(new Date().toISOString().slice(0, 10));
      setTeams('');
      setCoachName('');
      setCoachTeam('');
      setChallengedPlay(COMMON_PLAY_TYPES[0]);
      setCustomPlay('');
      setCoachResult('GANA');
      setReferees('');
      setAssistedIRS(true);
      setRefereeDecision('REVOCA');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Sync Coach result & Referee Decision when changed
  const handleCoachResultChange = (res: ChallengeResult) => {
    setCoachResult(res);
    if (res === 'GANA') {
      setRefereeDecision('REVOCA');
    } else if (res === 'PIERDE') {
      setRefereeDecision('MANTIENE');
    }
  };

  const handleDecisionChange = (dec: DecisionResult) => {
    setRefereeDecision(dec);
    if (dec === 'REVOCA') {
      setCoachResult('GANA');
    } else if (dec === 'MANTIENE') {
      setCoachResult('PIERDE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!gameNumber.trim()) newErrors.gameNumber = 'Ingrese el número o ID de juego';
    if (!coachName.trim()) newErrors.coachName = 'Ingrese el nombre del entrenador';
    if (!referees.trim()) newErrors.referees = 'Ingrese los nombres de los árbitros';

    const finalPlay = challengedPlay === 'OTRA' ? customPlay : challengedPlay;
    if (!finalPlay.trim()) newErrors.challengedPlay = 'Especifique la jugada desafiada';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const recordToSave: ReviewRecord = {
      id: initialData?.id || `rec-${Date.now()}`,
      gameNumber: gameNumber.trim(),
      date,
      teams: teams.trim() || undefined,
      coachName: coachName.trim(),
      coachTeam: coachTeam.trim() || undefined,
      challengedPlay: finalPlay.trim(),
      coachResult,
      referees: referees.trim(),
      assistedIRS,
      refereeDecision,
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt || Date.now(),
    };

    onSave(recordToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Editar Registro de Revisión' : 'Nueva Solicitud de Revisión (IRS)'}
              </h2>
              <p className="text-xs text-slate-400">
                Complete los datos del desafío del entrenador y la decisión arbitral.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Partido & Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" /> JUEGO N° *
              </label>
              <input
                type="text"
                placeholder="Ej: JUEGO N° 01"
                value={gameNumber}
                onChange={(e) => setGameNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.gameNumber && <p className="text-rose-400 text-[11px] mt-1">{errors.gameNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> FECHA
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                EQUIPOS (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Ej: Real Madrid vs Barça"
                value={teams}
                onChange={(e) => setTeams(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Coach's Challenge */}
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Coach's Challenge (Entrenador)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ENTRENADOR *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sergio Hernández"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                {errors.coachName && <p className="text-rose-400 text-[11px] mt-1">{errors.coachName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  EQUIPO DEL ENTRENADOR
                </label>
                <input
                  type="text"
                  placeholder="Ej: Capitanes"
                  value={coachTeam}
                  onChange={(e) => setCoachTeam(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Challenged Play Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                DESAFÍA JUGADA *
              </label>
              <select
                value={challengedPlay}
                onChange={(e) => setChallengedPlay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {COMMON_PLAY_TYPES.map((play) => (
                  <option key={play} value={play}>
                    {play}
                  </option>
                ))}
                <option value="OTRA">Otra jugada personalizada...</option>
              </select>

              {challengedPlay === 'OTRA' && (
                <input
                  type="text"
                  placeholder="Describa la jugada desafiada..."
                  value={customPlay}
                  onChange={(e) => setCustomPlay(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 mt-2"
                />
              )}
              {errors.challengedPlay && <p className="text-rose-400 text-[11px] mt-1">{errors.challengedPlay}</p>}
            </div>

            {/* Coach Outcome Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                RESULTADO DEL DESAFÍO
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCoachResultChange('GANA')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    coachResult === 'GANA'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4" /> GANA (Acierto Coach)
                </button>
                <button
                  type="button"
                  onClick={() => handleCoachResultChange('PIERDE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    coachResult === 'PIERDE'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <X className="w-4 h-4" /> PIERDE (Error Coach)
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Ref Order IRS */}
          <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Ref. Order IRS (Árbitros)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ÁRBITROS (TERNA ARBITRAL) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Fernández, Alejandro Sánchez, Carlos Vélez"
                  value={referees}
                  onChange={(e) => setReferees(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                {errors.referees && <p className="text-rose-400 text-[11px] mt-1">{errors.referees}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ASISTEN AL IRS
                </label>
                <button
                  type="button"
                  onClick={() => setAssistedIRS(!assistedIRS)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    assistedIRS
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {assistedIRS ? 'SÍ (Acuden a Monitor)' : 'NO (Sin IRS)'}
                </button>
              </div>
            </div>

            {/* Referee Final Decision */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                DECISIÓN ARBITRAL FINAL
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDecisionChange('MANTIENE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    refereeDecision === 'MANTIENE'
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  MANTIENE DECISIÓN
                </button>
                <button
                  type="button"
                  onClick={() => handleDecisionChange('REVOCA')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    refereeDecision === 'REVOCA'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  REVOCA DECISIÓN
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NOTAS Y OBSERVACIONES DE LA JUGADA (OPCIONAL)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Cambio de posesión a favor del equipo visitante tras verificar toque de dedos en balón fuera..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" /> Guardar Registro
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
