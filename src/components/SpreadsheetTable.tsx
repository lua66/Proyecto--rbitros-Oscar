import React, { useState, useMemo } from 'react';
import { ReviewRecord, ReviewFilters } from '../types';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';

interface SpreadsheetTableProps {
  records: ReviewRecord[];
  onEditRecord: (record: ReviewRecord) => void;
  onDeleteRecord: (record: ReviewRecord) => void;
  onOpenNewRecord: () => void;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onOpenNewRecord,
}) => {
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    coach: '',
    referee: '',
    result: 'ALL',
    playType: 'ALL',
    startDate: '',
    endDate: '',
  });

  const [sortField, setSortField] = useState<'date' | 'gameNumber' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [mobileDisplayMode, setMobileDisplayMode] = useState<'cards' | 'table'>('cards');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Unique lists for filter dropdowns
  const uniqueCoaches = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.coachName && set.add(r.coachName.trim()));
    return Array.from(set).sort();
  }, [records]);

  const uniqueReferees = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      r.referees.split(',').forEach((ref) => ref.trim() && set.add(ref.trim()));
    });
    return Array.from(set).sort();
  }, [records]);

  const uniquePlayTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.challengedPlay && set.add(r.challengedPlay.trim()));
    return Array.from(set).sort();
  }, [records]);

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        // Text Search (Game, Coach, Ref, Teams, Play)
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchGame = r.gameNumber.toLowerCase().includes(q);
          const matchCoach = r.coachName.toLowerCase().includes(q);
          const matchRef = r.referees.toLowerCase().includes(q);
          const matchPlay = r.challengedPlay.toLowerCase().includes(q);
          const matchTeams = (r.teams || '').toLowerCase().includes(q);
          if (!matchGame && !matchCoach && !matchRef && !matchPlay && !matchTeams) {
            return false;
          }
        }

        if (filters.coach && r.coachName.trim() !== filters.coach) return false;
        if (filters.referee && !r.referees.toLowerCase().includes(filters.referee.toLowerCase())) return false;
        if (filters.playType !== 'ALL' && r.challengedPlay.trim() !== filters.playType) return false;

        if (filters.result !== 'ALL') {
          if (filters.result === 'GANA' && r.coachResult !== 'GANA') return false;
          if (filters.result === 'PIERDE' && r.coachResult !== 'PIERDE') return false;
          if (filters.result === 'REVOCA' && r.refereeDecision !== 'REVOCA') return false;
          if (filters.result === 'MANTIENE' && r.refereeDecision !== 'MANTIENE') return false;
        }

        if (filters.startDate && r.date < filters.startDate) return false;
        if (filters.endDate && r.date > filters.endDate) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] || '';
        let valB: any = b[sortField] || '';
        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [records, filters, sortField, sortOrder]);

  const resetFilters = () => {
    setFilters({
      search: '',
      coach: '',
      referee: '',
      result: 'ALL',
      playType: 'ALL',
      startDate: '',
      endDate: '',
    });
  };

  const toggleSort = (field: 'date' | 'gameNumber' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
        
        {/* Mobile Header & Search Row */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* General Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Juego, Coach, Árbitro, Jugada..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors min-h-[40px]"
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors sm:hidden min-h-[40px] shrink-0 ${
                showMobileFilters || filters.coach || filters.referee || filters.result !== 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            {/* Display Mode Toggle for Mobile */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 md:hidden shrink-0">
              <button
                onClick={() => setMobileDisplayMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${
                  mobileDisplayMode === 'cards'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400'
                }`}
                title="Vista de Tarjetas"
              >
                Tarjetas
              </button>
              <button
                onClick={() => setMobileDisplayMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${
                  mobileDisplayMode === 'table'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400'
                }`}
                title="Vista de Tabla completa"
              >
                Tabla
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${showMobileFilters ? 'block' : 'hidden sm:grid'}`}>
            {/* Coach Filter */}
            <div>
              <select
                value={filters.coach}
                onChange={(e) => setFilters({ ...filters, coach: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500 min-h-[38px]"
              >
                <option value="">Todos los Entrenadores</option>
                {uniqueCoaches.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Referee Filter */}
            <div>
              <select
                value={filters.referee}
                onChange={(e) => setFilters({ ...filters, referee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500 min-h-[38px]"
              >
                <option value="">Todos los Árbitros</option>
                {uniqueReferees.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Filter */}
            <div>
              <select
                value={filters.result}
                onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500 min-h-[38px]"
              >
                <option value="ALL">Todos los Resultados</option>
                <option value="GANA">Desafío: Gana Coach</option>
                <option value="PIERDE">Desafío: Pierde Coach</option>
                <option value="REVOCA">Arbitraje: Revoca Decisión</option>
                <option value="MANTIENE">Arbitraje: Mantiene Decisión</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators & Reset */}
        {(filters.search || filters.coach || filters.referee || filters.result !== 'ALL' || filters.playType !== 'ALL') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Mostrando <strong className="text-amber-400">{filteredRecords.length}</strong> de {records.length} registros
            </span>
            <button
              onClick={resetFilters}
              className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1 font-medium touch-manipulation min-h-[32px] px-2"
            >
              <Filter className="w-3 h-3" /> Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* MOBILE CARDS VIEW (Displayed on mobile screens when mode is 'cards') */}
      {mobileDisplayMode === 'cards' && (
        <div className="block md:hidden space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 stroke-[1.5] mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No se encontraron registros de revisiones</p>
              <p className="text-xs text-slate-500 mt-1">Ajuste los filtros de búsqueda o añada un nuevo registro.</p>
              <button
                onClick={onOpenNewRecord}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                <Plus className="w-4 h-4" /> Registrar Revisión
              </button>
            </div>
          ) : (
            filteredRecords.map((r) => {
              const isCoachWon = r.coachResult === 'GANA';
              const isCoachLost = r.coachResult === 'PIERDE';
              const isDecisionRevoked = r.refereeDecision === 'REVOCA';

              return (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden"
                >
                  {/* Card Header: Game & Date */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                        {r.gameNumber}
                      </span>
                      {r.teams && (
                        <span className="text-xs font-semibold text-slate-300 truncate max-w-[140px]">
                          {r.teams}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {r.date || '-'}
                    </span>
                  </div>

                  {/* Coach & Challenge Row */}
                  <div className="grid grid-cols-1 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          Coach Challenge
                        </span>
                        <span className="text-xs font-bold text-white">
                          {r.coachName} {r.coachTeam ? `(${r.coachTeam})` : ''}
                        </span>
                      </div>
                      
                      {/* Coach Result Tag & F.Técnicas */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {r.technicalFouls && r.technicalFouls > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-extrabold">
                            {r.technicalFouls} {r.technicalFouls === 1 ? 'Técnica' : 'Técnicas'}
                          </span>
                        ) : null}
                        {isCoachWon ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> GANA
                          </span>
                        ) : isCoachLost ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> PIERDE
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Jugada Desafiada
                      </span>
                      <p className="text-xs text-amber-300 font-medium">{r.challengedPlay}</p>
                    </div>

                    {r.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg italic border border-slate-800">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  {/* Referees & Decision Row */}
                  <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Terna Arbitral / IRS
                      </span>
                      <p className="text-xs text-slate-300 truncate max-w-[180px]">{r.referees}</p>
                    </div>

                    {/* Referee Decision Tag */}
                    {isDecisionRevoked ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold">
                        REVOCA
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        MANTIENE
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => onEditRecord(r)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-manipulation min-h-[38px]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(r)}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950/50 text-rose-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-manipulation min-h-[38px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Main Table (Displayed on desktop or when 'table' mode is selected on mobile) */}
      <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${mobileDisplayMode === 'table' ? 'block' : 'hidden md:block'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">

            
            {/* Top Header Section Banner */}
            <thead>
              {/* Row 1: Master Title Headers */}
              <tr className="bg-slate-950 text-slate-200 border-b border-slate-800">
                <th colSpan={7} className="py-2.5 px-4 text-center font-bold text-xs uppercase tracking-wider text-amber-400 border-r border-slate-800 bg-amber-500/10">
                  COACH'S CHALLENGE (DESAFÍOS DE ENTRENADORES)
                </th>
                <th colSpan={4} className="py-2.5 px-4 text-center font-bold text-xs uppercase tracking-wider text-blue-400 bg-blue-500/10 border-r border-slate-800">
                  REF. ORDER IRS (REVISIONES DE ÁRBITROS)
                </th>
                <th className="py-2.5 px-2 text-center text-xs text-slate-400">ACCIONES</th>
              </tr>

              {/* Row 2: Detailed Column Titles */}
              <tr className="bg-slate-800/90 text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                {/* Coach Challenge Columns */}
                <th className="py-2.5 px-3 border-r border-slate-700 w-24">
                  <button onClick={() => toggleSort('gameNumber')} className="flex items-center gap-1 hover:text-amber-400">
                    JUEGO N° <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="py-2.5 px-3 border-r border-slate-700 w-28">
                  <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-amber-400">
                    FECHA <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="py-2.5 px-3 border-r border-slate-700 min-w-[140px]">ENTRENADOR</th>
                <th className="py-2.5 px-3 border-r border-slate-700 min-w-[180px]">DESAFÍA JUGADA</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-20 text-emerald-400 bg-emerald-950/20">GANA</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-20 text-rose-400 bg-rose-950/20">PIERDE</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-24 text-purple-400 bg-purple-950/20">F.TÉCNICAS</th>

                {/* Referee IRS Columns */}
                <th className="py-2.5 px-3 border-r border-slate-700 min-w-[160px]">ÁRBITROS</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-24">ASISTEN IRS</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-28 text-slate-300">MANT. DECISIÓN</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700 w-28 text-amber-400">REVOC. DECISIÓN</th>

                <th className="py-2.5 px-2 text-center w-20">OPCIONES</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800 text-xs sm:text-sm text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileSpreadsheet className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                      <p className="text-sm font-medium text-slate-400">No se encontraron registros de revisiones</p>
                      <p className="text-xs text-slate-500">Ajuste los filtros de búsqueda o añada un nuevo registro.</p>
                      <button
                        onClick={onOpenNewRecord}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        <Plus className="w-4 h-4" /> Registrar Revisión
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isCoachWon = r.coachResult === 'GANA';
                  const isCoachLost = r.coachResult === 'PIERDE';
                  const isDecisionRevoked = r.refereeDecision === 'REVOCA';
                  const isDecisionMaintained = r.refereeDecision === 'MANTIENE';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Game Number */}
                      <td className="py-3 px-3 font-semibold text-slate-200 border-r border-slate-800 whitespace-nowrap">
                        {r.gameNumber}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-400 border-r border-slate-800 whitespace-nowrap font-mono text-xs">
                        {r.date || '-'}
                      </td>

                      {/* Coach Name & Team */}
                      <td className="py-3 px-3 border-r border-slate-800 font-medium text-slate-100">
                        <div>{r.coachName}</div>
                        {r.coachTeam && (
                          <div className="text-[11px] text-slate-400 font-normal">{r.coachTeam}</div>
                        )}
                      </td>

                      {/* Challenged Play */}
                      <td className="py-3 px-3 border-r border-slate-800 text-slate-300">
                        <span>{r.challengedPlay}</span>
                        {r.notes && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">{r.notes}</p>
                        )}
                      </td>

                      {/* GANA (Coach Challenge Won) */}
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-bold">
                        {isCoachWon ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> SÍ
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* PIERDE (Coach Challenge Lost) */}
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-bold">
                        {isCoachLost ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> SÍ
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* F.TÉCNICAS */}
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-bold">
                        {r.technicalFouls && r.technicalFouls > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold">
                            {r.technicalFouls}
                          </span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>

                      {/* Referees */}
                      <td className="py-3 px-3 border-r border-slate-800 text-slate-200">
                        {r.referees}
                      </td>

                      {/* Assisted IRS */}
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-medium">
                        {r.assistedIRS ? (
                          <span className="text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            SÍ
                          </span>
                        ) : (
                          <span className="text-slate-500">NO</span>
                        )}
                      </td>

                      {/* Maintained Decision */}
                      <td className="py-3 px-3 text-center border-r border-slate-800">
                        {isDecisionMaintained ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                            MANTIENE
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Revoked Decision */}
                      <td className="py-3 px-3 text-center border-r border-slate-800">
                        {isDecisionRevoked ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                            REVOCA
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onEditRecord(r)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Editar registro"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>
              Total Partidos Registrados: <strong className="text-slate-200">{new Set(filteredRecords.map((r) => r.gameNumber)).size}</strong>
            </span>
            <span>|</span>
            <span>
              Total Revisiones: <strong className="text-slate-200">{filteredRecords.length}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Coach Gana: {filteredRecords.filter((r) => r.coachResult === 'GANA').length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Coach Pierde: {filteredRecords.filter((r) => r.coachResult === 'PIERDE').length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Árbitro Revoca: {filteredRecords.filter((r) => r.refereeDecision === 'REVOCA').length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> F.Técnicas: {filteredRecords.reduce((sum, r) => sum + (Number(r.technicalFouls) || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
