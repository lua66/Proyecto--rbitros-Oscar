export type ChallengeResult = 'GANA' | 'PIERDE' | 'N/A';
export type DecisionResult = 'MANTIENE' | 'REVOCA' | 'N/A';

export interface ReviewRecord {
  id: string;
  gameNumber: string;
  date: string;
  teams?: string;
  
  // Coach's Challenge
  coachName: string;
  coachTeam?: string;
  challengedPlay: string;
  coachResult: ChallengeResult;
  
  // Ref. Order IRS
  referees: string; // Comma-separated or referee names
  assistedIRS: boolean;
  refereeDecision: DecisionResult;
  
  notes?: string;
  createdAt: number;
}

export interface ReviewFilters {
  search: string;
  coach: string;
  referee: string;
  result: string;
  playType: string;
  startDate: string;
  endDate: string;
}

export interface RefereeStats {
  name: string;
  totalIRSAssisted: number;
  decisionsMaintained: number;
  decisionsRevoked: number;
  maintainRate: number; // percentage
  revocationRate: number; // percentage
}

export interface CoachStats {
  name: string;
  team?: string;
  totalChallenges: number;
  won: number;
  lost: number;
  winRate: number; // percentage
}

export interface PlayTypeStats {
  playType: string;
  count: number;
  revokedCount: number;
  maintainedCount: number;
}
