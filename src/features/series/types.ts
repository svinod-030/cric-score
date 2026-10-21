import { MatchState } from '../../types/match';

export type Series = {
    id: string;
    teamA: string;
    teamB: string;
    createdAt: string;
    endedAt?: string;
};

export type SeriesTally = {
    played: number;
    winsA: number;
    winsB: number;
    ties: number;
    noResult: number;
};

// One row of the history list: a series (seriesId set) or a single match (a "series of one").
export type HistoryGroup = {
    key: string;
    seriesId?: string;
    matches: MatchState[]; // newest first
};

export type SeriesAward = {
    type: 'mvp' | 'bestBatsman' | 'bestBowler';
    playerName: string;
    teamName: string; // Team the player played for (the team whose roster the name came from)
    stats: string;
};
