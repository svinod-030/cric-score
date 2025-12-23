export interface MatchConfig {
    teamA: string;
    teamB: string;
    overs: number;
    playersPerTeam: number;
    runsForWide: number;
    runsForNoBall: number;
    reballForWide: boolean;
    reballForNoBall: boolean;
}

// Basic types
export type Player = {
    id: string;
    name: string;
    runs: number;
    ballsFaced: number;
    isOut: boolean;
};

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'none';

export type Ball = {
    runs: number; // Runs off the bat or extras
    extraType: ExtraType;
    isWicket: boolean;
    isValidBall: boolean; // False if wide/no-ball and reball is enabled (or just logically not a legal delivery counting towards over)
};

export type Over = {
    balls: Ball[];
    bowlerName: string; // Placeholder
};

export type InningsState = {
    battingTeam: string;
    totalRuns: number;
    totalWickets: number;
    overs: Over[];
    currentOver: Ball[];
    strikerId: string; // ID of player
    nonStrikerId: string; // ID of player
};

export interface MatchState extends MatchConfig {
    isPlaying: boolean;
    currentInnings: 1 | 2;
    innings1: InningsState;
    innings2: InningsState;
}
