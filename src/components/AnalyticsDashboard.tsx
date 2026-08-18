import React, { useMemo } from 'react';
import { ReviewRecord } from '../types';
import { 
  calculateRefereeStats, 
  calculateCoachStats, 
  calculatePlayTypeStats 
} from '../utils/statsCalculator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Shield, UserCheck, AlertTriangle, Activity, Award, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface AnalyticsDashboardProps {
  records: ReviewRecord[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ records }) => {
  const refereeStats = useMemo(() => calculateRefereeStats(records), [records]);
  const coachStats = useMemo(() => calculateCoachStats(records), [records]);
  const playTypeStats = useMemo(() => calculatePlayTypeStats(records), [records]);

  // General Summary Metrics
  const totalReviews = records.length;
  const totalCoaches = coachStats.length;
  const totalReferees = refereeStats.length;

  const totalWonChallenges = records.filter((r) => r.coachResult === 'GANA').length;
  const totalLostChallenges = records.filter((r) => r.coachResult === 'PIERDE').length;
  const coachWinRate = totalReviews > 0 ? Math.round((totalWonChallenges / totalReviews) * 100) : 0;

  const totalRevokedDecisions = records.filter((r) => r.refereeDecision === 'REVOCA').length;
  const totalMaintainedDecisions = records.filter((r) => r.refereeDecision === 'MANTIENE').length;
  const decisionRevocationRate = totalReviews > 0 ? Math.round((totalRevokedDecisions / totalReviews) * 100) : 0;
  const totalTechnicalFouls = records.reduce((sum, r) => sum + (Number(r.technicalFouls) || 0), 0);

  // Pie chart data for overall outcomes
  const outcomePieData = [
    { name: 'Mantiene Decisión', value: totalMaintainedDecisions, color: '#3b82f6' },
    { name: 'Revoca Decisión', value: totalRevokedDecisions, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revisiones IRS</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{totalReviews}</div>
            <p className="text-xs text-slate-500 mt-1">En {new Set(records.map((r) => r.gameNumber)).size} partidos registrados</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Éxito de Entrenadores (Aciertos)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400">{coachWinRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{totalWonChallenges} ganados / {totalLostChallenges} perdidos</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Decisiones Revocadas</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-400">{decisionRevocationRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{totalRevokedDecisions} fallos corregidos en pantalla</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Árbitros Involucrados</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{totalReferees}</div>
            <p className="text-xs text-slate-500 mt-1">Evaluados en la terna arbitral</p>
          </div>
        </div>

      </div>

      {/* Charts Row 1: Referee IRS Decisions & Outcome Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Referee Accuracy Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Desglose de Decisiones por Árbitro
              </h3>
              <p className="text-xs text-slate-400">Decisiones mantenidas vs revocadas tras revisión en video</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={refereeStats.slice(0, 8)} margin={{ top: 10, right: 10, left: -25, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tick={{ fill: '#94a3b8' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="decisionsMaintained" name="Mantiene Decisión" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decisionsRevoked" name="Revoca Decisión" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcome Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Resultado Global del IRS
            </h3>
            <p className="text-xs text-slate-400">Proporción general de decisiones arbitrales</p>
          </div>

          <div className="h-56 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {outcomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Mantiene: <strong>{totalMaintainedDecisions}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Revoca: <strong>{totalRevokedDecisions}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row 2: Coach Challenge Success Rate & Play Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coach Challenge Performance Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Efectividad por Entrenador (Coach's Challenge)
            </h3>
            <p className="text-xs text-slate-400">Número de desafíos ganados vs perdidos por coach</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coachStats.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="won" name="Desafío Ganado" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Desafío Perdido" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Challenged Play Types Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Jugadas Más Desafiadas / Invocadas al IRS
            </h3>
            <p className="text-xs text-slate-400">Categorización por tipo de acción revisada</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={playTypeStats.slice(0, 5)} margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="playType" type="category" stroke="#94a3b8" fontSize={10} width={100} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="count" name="Cantidad de Revisiones" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Leaderboard Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Referee Leaderboard Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            Tabla de Asistencia e Intervenciones de Árbitros
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <th className="py-2.5 px-3">Árbitro</th>
                  <th className="py-2.5 px-3 text-center">IRS Total</th>
                  <th className="py-2.5 px-3 text-center text-blue-400">Mantiene</th>
                  <th className="py-2.5 px-3 text-center text-amber-400">Revoca</th>
                  <th className="py-2.5 px-3 text-center text-purple-400">F.Técnicas</th>
                  <th className="py-2.5 px-3 text-center">% Confirmación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {refereeStats.map((ref) => (
                  <tr key={ref.name} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{ref.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{ref.totalIRSAssisted}</td>
                    <td className="py-2.5 px-3 text-center text-blue-400">{ref.decisionsMaintained}</td>
                    <td className="py-2.5 px-3 text-center text-amber-400">{ref.decisionsRevoked}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-400">
                      {ref.technicalFouls || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                      {ref.maintainRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coach Leaderboard Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Tabla de Desafíos de Entrenadores
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <th className="py-2.5 px-3">Entrenador / Equipo</th>
                  <th className="py-2.5 px-3 text-center">Desafíos</th>
                  <th className="py-2.5 px-3 text-center text-emerald-400">Gana</th>
                  <th className="py-2.5 px-3 text-center text-rose-400">Pierde</th>
                  <th className="py-2.5 px-3 text-center text-purple-400">F.Técnicas</th>
                  <th className="py-2.5 px-3 text-center">% Éxito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {coachStats.map((coach) => (
                  <tr key={coach.name} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      <div>{coach.name}</div>
                      {coach.team && <div className="text-[10px] text-slate-500">{coach.team}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{coach.totalChallenges}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-400">{coach.won}</td>
                    <td className="py-2.5 px-3 text-center text-rose-400">{coach.lost}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-400">
                      {coach.technicalFouls || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                      {coach.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
