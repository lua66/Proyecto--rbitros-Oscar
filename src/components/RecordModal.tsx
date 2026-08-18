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
  const [technicalFouls, setTechnicalFouls] = useState<number>(0);

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
      setTechnicalFouls(Number(initialData.technicalFouls) || 0);
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
      setTechnicalFouls(0);
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
      technicalFouls: Math.max(0, Number(technicalFouls) || 0),
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl my-0 sm:my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {initialData ? 'Editar Registro de Revisión' : 'Nueva Solicitud de Revisión (IRS)'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Complete los datos del desafío y la decisión.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: Partido & Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" /> JUEGO N° *
              </label>
              <input
                type="text"
                placeholder="Ej: JUEGO N° 01"
                value={gameNumber}
                onChange={(e) => setGameNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
              />
            </div>
          </div>

          {/* Section 2: Coach's Challenge */}
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Coach's Challenge (Entrenador)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ENTRENADOR *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sergio Hernández"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 mt-2 min-h-[40px]"
                />
              )}
              {errors.challengedPlay && <p className="text-rose-400 text-[11px] mt-1">{errors.challengedPlay}</p>}
            </div>

            {/* Coach Outcome Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                RESULTADO DEL DESAFÍO
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCoachResultChange('GANA')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all touch-manipulation min-h-[42px] ${
                    coachResult === 'GANA'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0" /> GANA (Acierto)
                </button>
                <button
                  type="button"
                  onClick={() => handleCoachResultChange('PIERDE')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all touch-manipulation min-h-[42px] ${
                    coachResult === 'PIERDE'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <X className="w-4 h-4 shrink-0" /> PIERDE (Error)
                </button>
              </div>
            </div>

            {/* Technical Fouls Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  FALTAS TÉCNICAS (F.TÉCNICAS)
                </label>
                <span className="text-[11px] text-purple-400 font-bold">
                  {technicalFouls} {technicalFouls === 1 ? 'falta técnica' : 'faltas técnicas'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTechnicalFouls(num)}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all touch-manipulation min-h-[38px] ${
                      technicalFouls === num
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 min-h-[38px] w-24">
                  <span className="text-[10px] text-slate-500 mr-1">Otro:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={technicalFouls}
                    onChange={(e) => setTechnicalFouls(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-transparent text-xs text-purple-300 font-bold focus:outline-none text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Ref Order IRS */}
          <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Ref. Order IRS (Árbitros)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ÁRBITROS (TERNA ARBITRAL) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Fernández, Alejandro Sánchez, Carlos Vélez"
                  value={referees}
                  onChange={(e) => setReferees(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all touch-manipulation min-h-[40px] ${
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
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDecisionChange('MANTIENE')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all touch-manipulation min-h-[42px] ${
                    refereeDecision === 'MANTIENE'
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  MANTIENE DECISIÓN
                </button>
                <button
                  type="button"
                  onClick={() => handleDecisionChange('REVOCA')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all touch-manipulation min-h-[42px] ${
                    refereeDecision === 'REVOCA'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation min-h-[40px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg transition-all touch-manipulation min-h-[40px]"
            >
              <Save className="w-4 h-4" /> Guardar Registro
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
