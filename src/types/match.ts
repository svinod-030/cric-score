export interface MatchConfig {
    teamA: string;
    teamB: string;
    overs: number;
    playersPerTeam: number;
    runsForWide: number;
    runsForNoBall: number;
    reballForWide: boolean;
    reballForNoBall: boolean;
    tossWinner?: string; // We'll store the team name or ID? Let's use string 'Team A' or 'Team B' for now to match current simple setup
    tossDecision?: 'bat' | 'bowl';
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
    dismissal?: string;
};

export type BowlingStats = {
    playerId: string;
    overs: number;
    balls: number; // balls in current over (or total legal balls?) Let's track balls to calc partial overs
    maidens: number;
    runsConceded: number;
    wickets: number;
};

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'none';

export type Ball = {
    runs: number; // Runs off the bat or extras
    extraType: ExtraType;
    isWicket: boolean;
    isValidBall: boolean;
    batsmanId: string;
    bowlerId: string;
};

export type Over = {
    balls: Ball[];
    bowlerId: string;
};

export type InningsState = {
    battingTeam: string;
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
    completedAt?: string; // ISO string format
}
