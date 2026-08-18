import { ReviewRecord, RefereeStats, CoachStats, PlayTypeStats } from '../types';

export function calculateRefereeStats(records: ReviewRecord[]): RefereeStats[] {
  const refMap = new Map<string, { total: number; maintained: number; revoked: number; technicalFouls: number }>();

  records.forEach((rec) => {
    // split refs by comma if multiple
    const refList = rec.referees.split(',').map((r) => r.trim()).filter((r) => r.length > 0);

    refList.forEach((ref) => {
      const current = refMap.get(ref) || { total: 0, maintained: 0, revoked: 0, technicalFouls: 0 };
      if (rec.assistedIRS) {
        current.total += 1;
        if (rec.refereeDecision === 'MANTIENE') {
          current.maintained += 1;
        } else if (rec.refereeDecision === 'REVOCA') {
          current.revoked += 1;
        }
      }
      current.technicalFouls += Number(rec.technicalFouls) || 0;
      refMap.set(ref, current);
    });
  });

  const result: RefereeStats[] = [];
  refMap.forEach((val, name) => {
    const maintainRate = val.total > 0 ? Math.round((val.maintained / val.total) * 100) : 0;
    const revocationRate = val.total > 0 ? Math.round((val.revoked / val.total) * 100) : 0;
    result.push({
      name,
      totalIRSAssisted: val.total,
      decisionsMaintained: val.maintained,
      decisionsRevoked: val.revoked,
      technicalFouls: val.technicalFouls,
      maintainRate,
      revocationRate,
    });
  });

  return result.sort((a, b) => b.totalIRSAssisted - a.totalIRSAssisted);
}

export function calculateCoachStats(records: ReviewRecord[]): CoachStats[] {
  const coachMap = new Map<string, { won: number; lost: number; total: number; technicalFouls: number; team?: string }>();

  records.forEach((rec) => {
    const coachKey = rec.coachName.trim();
    if (!coachKey) return;

    const current = coachMap.get(coachKey) || { won: 0, lost: 0, total: 0, technicalFouls: 0, team: rec.coachTeam };
    current.total += 1;
    if (rec.coachResult === 'GANA') {
      current.won += 1;
    } else if (rec.coachResult === 'PIERDE') {
      current.lost += 1;
    }
    current.technicalFouls += Number(rec.technicalFouls) || 0;
    if (rec.coachTeam) current.team = rec.coachTeam;
    coachMap.set(coachKey, current);
  });

  const result: CoachStats[] = [];
  coachMap.forEach((val, name) => {
    const winRate = val.total > 0 ? Math.round((val.won / val.total) * 100) : 0;
    result.push({
      name,
      team: val.team,
      totalChallenges: val.total,
      won: val.won,
      lost: val.lost,
      technicalFouls: val.technicalFouls,
      winRate,
    });
  });

  return result.sort((a, b) => b.totalChallenges - a.totalChallenges);
}

export function calculatePlayTypeStats(records: ReviewRecord[]): PlayTypeStats[] {
  const playMap = new Map<string, { total: number; revoked: number; maintained: number }>();

  records.forEach((rec) => {
    const play = rec.challengedPlay.trim() || 'Otras Jugadas';
    const current = playMap.get(play) || { total: 0, revoked: 0, maintained: 0 };
    current.total += 1;
    if (rec.refereeDecision === 'REVOCA' || rec.coachResult === 'GANA') {
      current.revoked += 1;
    } else if (rec.refereeDecision === 'MANTIENE' || rec.coachResult === 'PIERDE') {
      current.maintained += 1;
    }
    playMap.set(play, current);
  });

  const result: PlayTypeStats[] = [];
  playMap.forEach((val, playType) => {
    result.push({
      playType,
      count: val.total,
      revokedCount: val.revoked,
      maintainedCount: val.maintained,
    });
  });

  return result.sort((a, b) => b.count - a.count);
}

export function exportToCSV(records: ReviewRecord[]): void {
  const headers = [
    'JUEGO N°',
    'FECHA',
    'EQUIPOS',
    'ENTRENADOR',
    'EQUIPO ENTRENADOR',
    'DESAFIA JUGADA',
    'RESULTADO DESAFIO (GANA/PIERDE)',
    'F.TECNICAS',
    'ARBITROS',
    'ASISTEN AL IRS',
    'DECISION ARBITRAL (MANTIENE/REVOCA)',
    'NOTAS',
  ];

  const rows = records.map((r) => [
    `"${r.gameNumber}"`,
    `"${r.date}"`,
    `"${r.teams || ''}"`,
    `"${r.coachName}"`,
    `"${r.coachTeam || ''}"`,
    `"${r.challengedPlay}"`,
    `"${r.coachResult}"`,
    `"${r.technicalFouls || 0}"`,
    `"${r.referees}"`,
    `"${r.assistedIRS ? 'SI' : 'NO'}"`,
    `"${r.refereeDecision}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Solicitudes_Revisiones_Arbitros_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
