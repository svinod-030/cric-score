export interface MatchConfig {
    teamA: string;
    teamB: string;
    overs: number;
    playersPerTeam: number;
    runsForWide: number;
    runsForNoBall: number;
    reballForWide: boolean;
    reballForNoBall: boolean;
    tossWinner?: 'teamA' | 'teamB';
    tossDecision?: 'bat' | 'bowl';
    isCustomNamesEnabled?: boolean;
    teamAPlayerNames?: string[];
    teamBPlayerNames?: string[];
    savedTeams?: Record<string, string[]>; // Team Name -> Player Names
}

// Basic types
// Basic types
export type Player = {
    id: string;
    name: string;
};

export type BattingStats = {
    playerId: string;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    isRetired: boolean;
    dismissal?: string;
    fielderId?: string;
    bowlerId?: string;
};

export type BowlingStats = {
    playerId: string;
    overs: number;
    balls: number; // balls in current over (or total legal balls?) Let's track balls to calc partial overs
    maidens: number;
    runsConceded: number;
    wickets: number;
};

export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'retired-hurt' | 'other' | 'none';

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'none';

export type Ball = {
    runs: number; // Runs off the bat or extras
    extraType: ExtraType;
    isWicket: boolean;
    wicketType: WicketType;
    isValidBall: boolean;
    batsmanId: string;
    bowlerId: string;
    fielderId?: string;
};

export type Over = {
    balls: Ball[];
    bowlerId: string;
};

export type InningsState = {
    battingTeam: string;
    battingTeamKey: 'teamA' | 'teamB';
    totalRuns: number;
    totalWickets: number;
    overs: Over[];
    currentOver: Ball[];

    // Player Positions
    strikerId: string;
    nonStrikerId: string;
    currentBowlerId: string | null;

    // Stats Maps
    battingStats: Record<string, BattingStats>;
    bowlingStats: Record<string, BowlingStats>;

    // Tracking
    fallOfWickets: { runs: number; wicket: number; over: string }[];
};

export type MatchResult = {
    winner: string | 'Draw';
    reason: string; // e.g. "By 20 runs" or "By 4 wickets"
} | null;

export interface MatchState extends MatchConfig {
    isPlaying: boolean;
    matchResult: MatchResult;
    currentInnings: 1 | 2;
    // Rosters
    teamAPlayers: Player[];
    teamBPlayers: Player[];

    innings1: InningsState;
    innings2: InningsState;
    isInningsBreak: boolean;
    completedAt?: string; // ISO string format
}
